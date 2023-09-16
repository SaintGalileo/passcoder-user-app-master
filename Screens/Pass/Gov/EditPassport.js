import { StyleSheet, Text, TextInput, Image, TouchableOpacity, ScrollView, View, ActivityIndicator, RefreshControl, Platform, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { AppColor } from '../../../utils/Color';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from '@react-native-firebase/storage';
import { BaseUrl } from '../../../utils/Url';
import DateTimePicker from '@react-native-community/datetimepicker';
import { validate_passport_number, validate_future_date, validate_past_date, user_bucket_url, allowed_extensions, maximum_file_size, return_trimmed_data, random_numbers } from '../../../utils/Validations';

export default function EditPassport({ route }) {

	const { passport_number, issued_date, expiry_date, proof: oldProof, verified } = route.params;
	const nav = useNavigation();

	const [uploading, setUploading] = useState(false);

	const [country, setCountry] = useState('Nigeria');
	const [passportNumber, setPassportNumber] = useState(passport_number);
	const [issuedDate, setIssuedDate] = useState(issued_date);
	const [expiryDate, setExpiryDate] = useState(expiry_date);

	const [isPickerShowIssuedDate, setIsPickerShowIssuedDate] = useState(false);
	const [isPickerShowExpiryDate, setIsPickerShowExpiryDate] = useState(false);
	const [dateIssuedDate, setDateIssuedDate] = useState(new Date(issued_date));
	const [dateExpiryDate, setDateExpiryDate] = useState(new Date(expiry_date));

	const showPickerIssuedDate = () => {
		setIsPickerShowIssuedDate(true);
	};

	const showPickerExpiryDate = () => {
		setIsPickerShowExpiryDate(true);
	};

	const onChangeIssuedDate = (event, value) => {
		setDateIssuedDate(value);
		setIssuedDate(value);
		if (Platform.OS === 'android') {
			setIsPickerShowIssuedDate(false);
		}
	};

	const onChangeExpiryDate = (event, value) => {
		setDateExpiryDate(value);
		setExpiryDate(value);
		if (Platform.OS === 'android') {
			setIsPickerShowExpiryDate(false);
		}
	};

	const [proof, setProof] = useState('');
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

	async function UpdatePassport() {
		const _issued_date_ = new Date(issuedDate);
		const _issued_date = _issued_date_.getFullYear() + "-" + ((_issued_date_.getUTCMonth() + 1) < 10 ? "0" + (_issued_date_.getUTCMonth() + 1) : (_issued_date_.getUTCMonth() + 1));
		const _expiry_date_ = expiryDate ? new Date(expiryDate) : null;
		const _expiry_date = expiryDate ? (_expiry_date_.getFullYear() + "-" + ((_expiry_date_.getUTCMonth() + 1) < 10 ? "0" + (_expiry_date_.getUTCMonth() + 1) : (_expiry_date_.getUTCMonth() + 1))) : null;
		if (!passportNumber) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Passport Number is required"
			})
		} else if (!validate_passport_number(passportNumber)) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Invalid Passport Number"
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
		// else if (!expiryDate) {
		// 	Toast.show({
		// 		type: "error",
		// 		text1: "Error",
		// 		text2: "Expiry date is required"
		// 	})
		// } 
		else if (expiryDate && !validate_future_date(_expiry_date)) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Invalid expiry date"
			})
		} 
		// else if (!proof || proof.length === 0) {
		// 	Toast.show({
		// 		type: "error",
		// 		text1: "Error",
		// 		text2: "Passport Scan is required"
		// 	})
		// } 
		else {
			setUploading(true);

			const userToken = await AsyncStorage.getItem('userToken');
			const userPID = await AsyncStorage.getItem('userPID');

			fetch(`${BaseUrl}/proofs/government/passport`, {
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

				fetch(`${BaseUrl}/user/passport/edit/all`, {
					method: "PUT",
					headers: {
						'passcoder-access-token': userToken,
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						country: country,
						passport_number: return_trimmed_data(passportNumber),
						issued_date: _issued_date,
						expiry_date: _expiry_date && _expiry_date.length > 0 ? _expiry_date : undefined
					})
				}).then(async (res) => {
					if (res.status === 204) {
						if (proof) {
							let lastDot = proof.lastIndexOf('.');
							let ext = proof.substring(lastDot + 1);
	
							const new_proof_name = proof_rename + "." + ext;
							const proof_path = "/users/" + new_proof_name;

							const reference = storage().refFromURL(`${user_bucket_url}${new_proof_name}`);
							await reference.putFile(proof).then(async () => {
								const url = await storage().refFromURL(`${user_bucket_url}${new_proof_name}`).getDownloadURL().then((res) => {
									fetch(`${BaseUrl}/user/passport/edit/proofs`, {
										method: "POST",
										headers: {
											'passcoder-access-token': userToken,
											'Accept': 'application/json',
											'Content-Type': 'application/json',
										},
										body: JSON.stringify({
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
												text2: "Details & scan updated successfully!"
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
					<Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>International Passport</Text>
					<Text style={{ fontFamily: "lexendLight" }}>Update relevant details</Text>
				</View>
				<View />
			</View>

			<ScrollView style={{ marginBottom: 100 }}>
				<View style={{ margin: 15, marginTop: 30 }}>
					<View style={{ marginBottom: 20 }}>
						<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Passport Number</Text>
						<TextInput
							editable={!verified}
							value={passportNumber}
							maxLength={9}
							onChangeText={(txt) => setPassportNumber(txt)}
							keyboardType='default'
							style={styles.inputStyle}
							placeholder='Enter Passport Number'
						/>
					</View>

					<View style={{ marginBottom: 20 }}>
						<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Issued Date</Text>
						<TouchableOpacity onPress={showPickerIssuedDate} style={{ flexDirection: "row", backgroundColor: "#eee", height: 45, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
							{(!isPickerShowIssuedDate || Platform.OS === "android") && (
								<Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{issuedDate ? `${new Date(issuedDate).getFullYear()}-${(new Date(issuedDate).getUTCMonth() + 1) < 10 ? "0" + (new Date(issuedDate).getUTCMonth() + 1) : (new Date(issuedDate).getUTCMonth() + 1)}` : "YYYY-MM"}</Text>
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

					<View style={{ marginBottom: 20 }}>
						<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Expiry Date</Text>
						<TouchableOpacity onPress={showPickerExpiryDate} style={{ flexDirection: "row", backgroundColor: "#eee", height: 45, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
							{(!isPickerShowExpiryDate || Platform.OS === "android") && (
								<Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{expiryDate ? `${new Date(expiryDate).getFullYear()}-${(new Date(expiryDate).getUTCMonth() + 1) < 10 ? "0" + (new Date(expiryDate).getUTCMonth() + 1) : (new Date(expiryDate).getUTCMonth() + 1)}` : "YYYY-MM"}</Text>
							)}
							{(isPickerShowExpiryDate && Platform.OS === "ios") && (
								<DateTimePicker
									value={dateExpiryDate}
									mode={'date'}
									maximumDate={new Date()}
									display={Platform.OS === 'ios' ? 'default' : 'spinner'}
									is24Hour={true}
									onChange={onChangeExpiryDate}
								/>
							)}
							<Ionicons name="calendar-sharp" size={24} color="grey" style={{ marginRight: 10 }} />
						</TouchableOpacity>
					</View>

					{
						oldProof ? 
							<View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
								<Text style={{ fontFamily: "lexendMedium", marginBottom: 10 }}>Current Passport Scan</Text>
								<Image style={{ height: 200, width: 300 }} resizeMode='contain' source={{ uri: oldProof }} />
							</View> : ""
					}

					<View style={{ marginBottom: 20 }}>
						<Text style={{ fontFamily: "lexendBold", marginBottom: 5 }}>Passport Scan</Text>
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
						<TouchableOpacity onPress={UpdatePassport} disabled={uploading} style={{ backgroundColor: AppColor.Blue, borderRadius: 8, height: 50, width: 300, justifyContent: "center", alignItems: "center" }}>
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

			{/* The date picker */}
			{(isPickerShowExpiryDate && Platform.OS === "android") && (
				<DateTimePicker
					value={dateExpiryDate}
					mode={'date'}
					maximumDate={new Date()}
					display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
					is24Hour={true}
					onChange={onChangeExpiryDate}
					style={styles.datePicker}
				/>
			)}
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