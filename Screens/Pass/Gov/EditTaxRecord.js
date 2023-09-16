import { StyleSheet, Text, Image, TextInput, TouchableOpacity, ScrollView, View, ActivityIndicator, RefreshControl, Platform, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { AppColor } from '../../../utils/Color'
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from '@react-native-firebase/storage';
import { BaseUrl } from '../../../utils/Url';
import DateTimePicker from '@react-native-community/datetimepicker';
import { validate_cac_and_tin_number, validate_document_reference, validate_past_date, user_bucket_url, allowed_extensions, maximum_file_size, random_numbers, return_trimmed_data } from '../../../utils/Validations';

export default function EditTaxRecord({ route }) {

	const { unique_id, tin, doc_ref, issued_date } = route.params;
	const nav = useNavigation();

	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);

	const [TIN, setTIN] = useState(tin);
	const [docRef, setDocRef] = useState(doc_ref);
	const [issuedDate, setIssuedDate] = useState(issued_date);

	const [isPickerShowIssuedDate, setIsPickerShowIssuedDate] = useState(false);
	const [dateIssuedDate, setDateIssuedDate] = useState(new Date(issued_date));

	const showPickerIssuedDate = () => {
		setIsPickerShowIssuedDate(true);
	};

	const onChangeIssuedDate = (event, value) => {
		setDateIssuedDate(value);
		setIssuedDate(value);
		if (Platform.OS === 'android') {
			setIsPickerShowIssuedDate(false);
		}
	};

	const [proof, setProof] = useState('');
	const [verified, setVerified] = useState(false);
	const [oldProof, setOldProof] = useState('');
	const [oldProofExt, setOldProofExt] = useState('');

	async function GetTaxRecord() {
		setLoading(true);
		const userToken = await AsyncStorage.getItem('userToken')
		fetch(`${BaseUrl}/user/tax/record`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',

			},
			body: JSON.stringify({
				unique_id: unique_id
			})
		}).then(async (res) => {
			const response = await res.json();
			setTIN(response.data.tin);
			setDocRef(response.data.doc_ref);
			setIssuedDate(response.data.issued_date);
			setVerified(response.data.verified);

			let lastDot = response.data.proof.lastIndexOf('.');
			let ext = response.data.proof.substring(lastDot + 1);
			setOldProof(response.data.proof);
			setOldProofExt(ext.toUpperCase());
			setLoading(false);
		}).catch((err) => {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "An error occured while getting Tax Record data"
			})
		})
	}

	useEffect(() => {
		GetTaxRecord()
	}, []);

	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		GetTaxRecord().then(() => { setRefreshing(false) }).catch(() => setRefreshing(false));
	}, []);

	const [preview, setPreview] = useState({});

	const pickProof = async () => {
		try {
			const documentSelection = await DocumentPicker.getDocumentAsync({ multiple: false, type: allowed_extensions });
			if (documentSelection.canceled === true) {
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "Cancelled file select"
				})
			} else {
				setPreview({
					size: ((documentSelection.assets[0].size / 1024) / 1024).toFixed(2),
					extension: documentSelection.assets[0].mimeType.split("/")[1].toUpperCase(),
					file: documentSelection.assets[0].uri
				});
				if (documentSelection.assets[0].size > maximum_file_size) {
					Toast.show({
						type: "error",
						text1: "Error",
						text2: "File is too large (max 5mb)"
					})
				} else {
					setProof(documentSelection.assets[0].uri);
				}
			}

		} catch (error) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Error occured while getting file system"
			})
		}
	};

	async function UpdateTaxRecord() {
		const _issued_date_ = new Date(issuedDate);
		const _issued_date = _issued_date_.getFullYear() + "-" + ((_issued_date_.getUTCMonth() + 1) < 10 ? "0" + (_issued_date_.getUTCMonth() + 1) : (_issued_date_.getUTCMonth() + 1)) + "-" + (_issued_date_.getDate() < 10 ? "0" + _issued_date_.getDate() : _issued_date_.getDate());
		if (!TIN) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Tax Identification Number is required"
			})
		} else if (!validate_cac_and_tin_number(TIN)) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Invalid Tax Identification Number"
			})
		} else if (!docRef) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Document Reference is required"
			})
		} else if (!validate_document_reference(docRef)) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Invalid Document Reference"
			})
		} else if (!issuedDate) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Issued date is required"
			})
		} else if (!validate_past_date(_issued_date)) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Invalid issued date"
			})
		} 
		// else if (!proof || proof.length === 0) {
		// 	Toast.show({
		// 		type: "error",
		// 		text1: "Error",
		// 		text2: "Proof is required"
		// 	})
		// } 
		else {
			setUploading(true);

			const userToken = await AsyncStorage.getItem('userToken');
			const userPID = await AsyncStorage.getItem('userPID');

			fetch(`${BaseUrl}/proofs/government/tax/record`, {
				method: "POST",
				headers: {
					'passcoder-access-token': userToken,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					pid: userPID
				})
			}).then(async (res) => {
				const proof_res = await res.json();
				const proof_rename = proof_res.data ? proof_res.data[0].proof : "1" + random_numbers(20);

				fetch(`${BaseUrl}/user/tax/record/edit/all`, {
					method: "PUT",
					headers: {
						'passcoder-access-token': userToken,
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						unique_id: unique_id,
						tin: return_trimmed_data(TIN),
						doc_ref: return_trimmed_data(docRef),
						issued_date: _issued_date,
					})
				}).then(async (res) => {
					if (res.status === 204 || res.status === 200) {
						if (proof) {
							let lastDot = proof.lastIndexOf('.');
							let ext = proof.substring(lastDot + 1);
	
							const new_proof_name = proof_rename + "." + ext;
							const proof_path = "/users/" + new_proof_name;

							const reference = storage().refFromURL(`${user_bucket_url}${new_proof_name}`);
							await reference.putFile(proof).then(async () => {
								const url = await storage().refFromURL(`${user_bucket_url}${new_proof_name}`).getDownloadURL().then((res) => {
									fetch(`${BaseUrl}/user/tax/record/edit/proof`, {
										method: "POST",
										headers: {
											'passcoder-access-token': userToken,
											'Accept': 'application/json',
											'Content-Type': 'application/json',
										},
										body: JSON.stringify({
											unique_id: unique_id,
											proof: res,
											proof_file_ext: proof_path
										})
									}).then(async (res) => {
										const upload_proof_res = await res.json();
	
										if (upload_proof_res.success) {
											setUploading(false);
											Toast.show({
												type: "success",
												text1: "Success",
												text2: "Details & proof updated successfully!"
											})
											nav.goBack();
										} else {
											setUploading(false);
											Toast.show({
												type: "error",
												text1: "Error",
												text2: upload_proof_res.message
											})
										}
									}).catch((err) => {
										setUploading(false);
										Toast.show({
											type: "error",
											text1: "Error",
											text2: "An error occured"
										})
									})
								})
							})
						} else {
							setUploading(false);
							Toast.show({
								type: "success",
								text1: "Success",
								text2: "Details updated successfully!"
							})
							nav.goBack();
						}
					} else {
						const error_res = await res.json();
						setUploading(false);
						Toast.show({
							type: "error",
							text1: "Error",
							text2: res.status !== 422 ? "Error occured while updating" : error_res.data[0].msg
						});
					}
				}).catch((err) => {
					setUploading(false);
					Toast.show({
						type: "error",
						text1: "Error",
						text2: "An error occured"
					});
				})
			})
		}
	};
	
	return (
		<View style={styles.wrapper}>
			{/*Top bar*/}
			<View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
				<Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
				<View style={{ alignItems: "center" }}>
					<Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>Tax Records</Text>
					<Text style={{ fontFamily: "lexendLight" }}>Update relevant details</Text>
				</View>
				<View />
			</View>

			{loading ? (
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<ActivityIndicator color={AppColor.Blue} size={'large'} />
				</View>
			) : 
				<>
					<ScrollView style={{ marginBottom: 100 }} refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}>
						<View style={{ margin: 15, marginTop: 30 }}>
							<View style={{ marginBottom: 20 }}>
								<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Tax Identification Number</Text>
								<TextInput
									editable={!verified}
									value={TIN}
									onChangeText={(txt) => setTIN(txt)}
									keyboardType='number-pad'
									style={styles.inputStyle}
									placeholder='Enter Tax Identification Number'
								/>
							</View>

							<View style={{ marginBottom: 20 }}>
								<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Document Reference</Text>
								<TextInput
									editable={!verified}
									value={docRef}
									onChangeText={(txt) => setDocRef(txt)}
									keyboardType='default'
									style={styles.inputStyle}
									placeholder='Enter Document reference'
								/>
							</View>

							<View style={{ marginBottom: 20 }}>
								<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Issued Date</Text>
								<TouchableOpacity onPress={showPickerIssuedDate} style={{ flexDirection: "row", backgroundColor: "#eee", height: 45, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
									{(!isPickerShowIssuedDate || Platform.OS === "android") && (
										<Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{issuedDate ? `${new Date(issuedDate).getFullYear()}-${(new Date(issuedDate).getUTCMonth() + 1) < 10 ? "0" + (new Date(issuedDate).getUTCMonth() + 1) : (new Date(issuedDate).getUTCMonth() + 1)}-${new Date(issuedDate).getDate() < 10 ? "0" + new Date(issuedDate).getDate() : new Date(issuedDate).getDate()}` : "YYYY-MM-DD"}</Text>
									)}
									{(isPickerShowIssuedDate && Platform.OS === "ios") && (
										<DateTimePicker
											value={dateIssuedDate}
											mode={'date'}
											maximumDate={new Date()}
											display={Platform.OS === 'ios' ? 'default' : 'spinner'}
											is24Hour={true}
											onChange={onChangeIssuedDate}
										/>
									)}
									<Ionicons name="calendar-sharp" size={24} color="grey" style={{ marginRight: 10 }} />
								</TouchableOpacity>
							</View>

							{
								oldProof ? 
									<View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
										<Text style={{ fontFamily: "lexendMedium", marginBottom: 10 }}>Current Proof</Text>
										{
											oldProofExt !== "PDF" ?
												<Image style={{ height: 300, width: 250 }} resizeMode='contain' source={{ uri: oldProof }} /> : 
												<Text style={{ fontFamily: "lexendLight", marginBottom: 10 }}>{oldProof.split("/")[4]}</Text>
										}
									</View> : ""
							}

							<View style={{ marginBottom: 20 }}>
								<Text style={{ fontFamily: "lexendBold", marginBottom: 5 }}>Proof</Text>
								<Text style={{ fontFamily: "lexendLight", marginBottom: 10 }}>Best to save images to pdf before upload!</Text>
								<TouchableOpacity disabled={verified} onPress={pickProof} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
									<Text style={{ fontFamily: "lexendBold", color: 'grey', paddingLeft: 20 }}>{preview?.extension ? `${preview?.extension + " - " + preview?.size + "MB"}` : "Select Document"}</Text>
									<Ionicons name="cloud-upload-outline" size={24} color="grey" style={{ marginRight: 10 }} />
								</TouchableOpacity>
							</View>
							{
								preview?.extension && preview?.extension !== "PDF" ?
									<View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
										<Image style={{ height: 250, width: 250 }} resizeMode='contain' source={{ uri: preview?.file }} />
									</View> : ""
							}
						</View>
					</ScrollView>
					
					{
						verified ? 
							"" : 
							<View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: 20 }}>
								<TouchableOpacity onPress={UpdateTaxRecord} disabled={uploading} style={{ backgroundColor: AppColor.Blue, borderRadius: 8, height: 50, width: 300, justifyContent: "center", alignItems: "center" }}>
									{
										uploading ? (
											<ActivityIndicator size={'small'} color={'#fff'} />
										) : (
											<Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Save Changes</Text>
										)
									}
								</TouchableOpacity>
							</View>
					}

					{/* The date picker */}
					{(isPickerShowIssuedDate && Platform.OS === "android") && (
						<DateTimePicker
							value={dateIssuedDate}
							mode={'date'}
							maximumDate={new Date()}
							display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
							is24Hour={true}
							onChange={onChangeIssuedDate}
							style={styles.datePicker}
						/>
					)}
				</>
			}
		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: "#fff"
	},
	inputStyle: {
		height: 50,
		backgroundColor: "#eee",
		borderRadius: 8,
		paddingLeft: 20,
		paddingRight: 20,
		fontFamily: "lexendMedium"
	},
	// This only works on iOS
	datePicker: {
		width: Dimensions.get('screen').width,
		height: 200,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'flex-start'
	},
})