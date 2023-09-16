import { StyleSheet, Text, TextInput, Image, TouchableOpacity, View, ActivityIndicator, ScrollView, Platform, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AppColor } from '../../../utils/Color';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from '@react-native-firebase/storage';
import { BaseUrl } from '../../../utils/Url';
import DateTimePicker from '@react-native-community/datetimepicker';
import { validate_driver_licence_number, validate_future_date, validate_past_date, user_bucket_url, allowed_image_extensions, maximum_file_size, return_trimmed_data, random_numbers } from '../../../utils/Validations';

export default function AddDriverLicence() {

	const nav = useNavigation();

	const [uploading, setUploading] = useState(false);

	const [licenceNumber, setLicenceNumber] = useState('');
	const [issuedDate, setIssuedDate] = useState('');
	const [expiryDate, setExpiryDate] = useState('');

	const [proofFront, setProofFront] = useState('');
	const [previewFront, setPreviewFront] = useState({});
	const [proofBack, setProofBack] = useState('');
	const [previewBack, setPreviewBack] = useState({});

	const [isPickerShowIssuedDate, setIsPickerShowIssuedDate] = useState(false);
	const [isPickerShowExpiryDate, setIsPickerShowExpiryDate] = useState(false);
	const [dateIssuedDate, setDateIssuedDate] = useState(new Date(Date.now()));
	const [dateExpiryDate, setDateExpiryDate] = useState(new Date(Date.now()));

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

	const pickProofFront = async () => {
		try {
			const documentSelection = await DocumentPicker.getDocumentAsync({ multiple: false, type: allowed_image_extensions });
			if (documentSelection.canceled === true) {
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "Cancelled file select"
				})
			} else {
				setPreviewFront({
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
					setProofFront(documentSelection.assets[0].uri);
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

	const pickProofBack = async () => {
		try {
			const documentSelection = await DocumentPicker.getDocumentAsync({ multiple: false, type: allowed_image_extensions });
			if (documentSelection.canceled === true) {
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "Cancelled file select"
				})
			} else {
				setPreviewBack({
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
					setProofBack(documentSelection.assets[0].uri);
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

	async function UploadDriverLicence() {
		const _issued_date_ = new Date(issuedDate);
		const _issued_date = _issued_date_.getFullYear() + "-" + ((_issued_date_.getUTCMonth() + 1) < 10 ? "0" + (_issued_date_.getUTCMonth() + 1) : (_issued_date_.getUTCMonth() + 1)) + "-" + (_issued_date_.getDate() < 10 ? "0" + _issued_date_.getDate() : _issued_date_.getDate());
		const _expiry_date_ = new Date(expiryDate);
		const _expiry_date = _expiry_date_.getFullYear() + "-" + ((_expiry_date_.getUTCMonth() + 1) < 10 ? "0" + (_expiry_date_.getUTCMonth() + 1) : (_expiry_date_.getUTCMonth() + 1)) + "-" + (_expiry_date_.getDate() < 10 ? "0" + _expiry_date_.getDate() : _expiry_date_.getDate());
		if (!licenceNumber) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Licence Number is required"
			})
		} else if (!validate_driver_licence_number(licenceNumber)) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Invalid Licence Number"
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
		} else if (!expiryDate) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Expiry date is required"
			})
		} else if (!validate_future_date(_expiry_date)) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Invalid expiry date"
			})
		} else if (!proofFront || proofFront.length === 0) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Front of Licence is required"
			})
		} else if (!proofBack || proofBack.length === 0) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Back of Licence is required"
			})
		} else {
			setUploading(true);

			const userToken = await AsyncStorage.getItem('userToken');
			const userPID = await AsyncStorage.getItem('userPID');

			fetch(`${BaseUrl}/proofs/government/driver/licence`, {
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
				const proof_front_rename = proof_res.data ? proof_res.data[0].proof_front : "1" + random_numbers(20);
				const proof_back_rename = proof_res.data ? proof_res.data[1].proof_back : "1" + random_numbers(20);

				fetch(`${BaseUrl}/user/driver/licence/add`, {
					method: "POST",
					headers: {
						'passcoder-access-token': userToken,
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						licence_number: return_trimmed_data(licenceNumber),
						issued_date: _issued_date,
						expiry_date: _expiry_date
					})
				}).then(async (res) => {
					const upload_details_res = await res.json();

					if (upload_details_res.success) {
						let lastDotFront = proofFront.lastIndexOf('.');
						let extFront = proofFront.substring(lastDotFront + 1);

						let lastDotBack = proofBack.lastIndexOf('.');
						let extBack = proofBack.substring(lastDotBack + 1);

						const new_proof_front_name = proof_front_rename + "." + extFront;
						const proof_front_path = "/users/" + new_proof_front_name;

						const new_proof_back_name = proof_back_rename + "." + extBack;
						const proof_back_path = "/users/" + new_proof_back_name;

						const reference_front = storage().refFromURL(`${user_bucket_url}${new_proof_front_name}`);
						await reference_front.putFile(proofFront).then(async () => {
							const url = await storage().refFromURL(`${user_bucket_url}${new_proof_front_name}`).getDownloadURL().then(async (res_front) => {
								const reference_back = storage().refFromURL(`${user_bucket_url}${new_proof_back_name}`);
								await reference_back.putFile(proofBack).then(async () => {
									const url = await storage().refFromURL(`${user_bucket_url}${new_proof_back_name}`).getDownloadURL().then((res_back) => {
										fetch(`${BaseUrl}/user/driver/licence/edit/proofs`, {
											method: "POST",
											headers: {
												'passcoder-access-token': userToken,
												'Accept': 'application/json',
												'Content-Type': 'application/json',
											},
											body: JSON.stringify({
												proof_front: res_front,
												proof_front_file_ext: proof_front_path,
												proof_back: res_back,
												proof_back_file_ext: proof_back_path
											})
										}).then(async (res) => {
											const upload_proof_res = await res.json();
		
											if (upload_proof_res.success) {
												setUploading(false);
												Toast.show({
													type: "success",
													text1: "Success",
													text2: "Details uploaded successfully!"
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
							})
						})
					} else {
						setUploading(false);
						Toast.show({
							type: "error",
							text1: "Error",
							text2: res.status !== 422 ? upload_details_res.message : upload_details_res.data[0].msg
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
					<Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>Driver Licence</Text>
					<Text style={{ fontFamily: "lexendLight" }}>Insert relevant details</Text>
				</View>
				<View />
			</View>

			<ScrollView style={{ marginBottom: 100 }}>
				<View style={{ margin: 15, marginTop: 30 }}>
					<View style={{ marginBottom: 20 }}>
						<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Licence Number</Text>
						<TextInput
							maxLength={20}
							onChangeText={(txt) => setLicenceNumber(txt)}
							keyboardType='default'
							style={styles.inputStyle}
							placeholder='Enter Licence Number'
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

					<View style={{ marginBottom: 20 }}>
						<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Expiry Date</Text>
						<TouchableOpacity onPress={showPickerExpiryDate} style={{ flexDirection: "row", backgroundColor: "#eee", height: 45, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
							{(!isPickerShowExpiryDate || Platform.OS === "android") && (
								<Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{expiryDate ? `${new Date(expiryDate).getFullYear()}-${(new Date(expiryDate).getUTCMonth() + 1) < 10 ? "0" + (new Date(expiryDate).getUTCMonth() + 1) : (new Date(expiryDate).getUTCMonth() + 1)}-${new Date(expiryDate).getDate() < 10 ? "0" + new Date(expiryDate).getDate() : new Date(expiryDate).getDate()}` : "YYYY-MM-DD"}</Text>
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

					<View style={{ marginBottom: 20 }}>
						<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Front of Licence</Text>
						<TouchableOpacity onPress={pickProofFront} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
							<Text style={{ fontFamily: "lexendBold", color: 'grey', paddingLeft: 20 }}>{previewFront?.extension ? `${previewFront?.extension + " - " + previewFront?.size + "MB"}` : "Select Document"}</Text>
							<Ionicons name="cloud-upload-outline" size={24} color="grey" style={{ marginRight: 10 }} />
						</TouchableOpacity>
					</View>

					{
						previewFront?.extension && previewFront?.extension !== "PDF" ?
							<View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
								<Image style={{ height: 250, width: 250 }} resizeMode='contain' source={{ uri: previewFront?.file }} />
							</View> : ""
					}

					<View style={{ marginBottom: 20 }}>
						<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Back of Licence</Text>
						<TouchableOpacity onPress={pickProofBack} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
							<Text style={{ fontFamily: "lexendBold", color: 'grey', paddingLeft: 20 }}>{previewBack?.extension ? `${previewBack?.extension + " - " + previewBack?.size + "MB"}` : "Select Document"}</Text>
							<Ionicons name="cloud-upload-outline" size={24} color="grey" style={{ marginRight: 10 }} />
						</TouchableOpacity>
					</View>

					{
						previewBack?.extension && previewBack?.extension !== "PDF" ?
							<View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
								<Image style={{ height: 250, width: 250 }} resizeMode='contain' source={{ uri: previewBack?.file }} />
							</View> : ""
					}
				</View>
			</ScrollView>

			<View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: 20 }}>
				<TouchableOpacity onPress={UploadDriverLicence} disabled={uploading} style={{ backgroundColor: AppColor.Blue, borderRadius: 8, height: 50, width: 300, justifyContent: "center", alignItems: "center" }}>
					{
						uploading ? (
							<ActivityIndicator size={'small'} color={'#fff'} />
						) : (
							<Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Upload</Text>
						)
					}
				</TouchableOpacity>
			</View>

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