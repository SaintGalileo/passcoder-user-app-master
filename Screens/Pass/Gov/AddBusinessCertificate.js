import { StyleSheet, Text, TextInput, Image, TouchableOpacity, View, ScrollView, ActivityIndicator, Platform, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { AppColor } from '../../../utils/Color'
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import Modal from "react-native-modal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from '@react-native-firebase/storage';
import { BaseUrl } from '../../../utils/Url';
import DateTimePicker from '@react-native-community/datetimepicker';
import { validate_url, validate_rc_number, validate_email, validate_past_date, user_bucket_url, allowed_extensions, maximum_file_size, return_trimmed_data, random_numbers } from '../../../utils/Validations';

export default function AddBusinessCertificate() {

	const nav = useNavigation();

	const [uploading, setUploading] = useState(false);

	const [companyName, setCompanyName] = useState('');
	const [companyEmail, setCompanyEmail] = useState('');
	const [companyRcNumber, setCompanyRcNumber] = useState('');
	const [companyType, setCompanyType] = useState('BN');
	const [companyAddress, setCompanyAddress] = useState('');
	const [websiteUrl, setWebsiteUrl] = useState('');
	const [registrationDate, setRegistrationDate] = useState('');

	const [registrationDocument, setRegistrationDocument] = useState('');
	const [previewRegistrationDocument, setPreviewRegistrationDocument] = useState({});
	const [registrationCertificate, setRegistrationCertificate] = useState('');
	const [previewRegistrationCertificate, setPreviewRegistrationCertificate] = useState({});

	const [isPickerShowRegistrationDate, setIsPickerShowRegistrationDate] = useState(false);
	const [dateRegistrationDate, setDateRegistrationDate] = useState(new Date(Date.now()));

	const [companyTypeModal, setCompanyTypeModal] = useState(false);

	const showPickerRegistrationDate = () => {
		setIsPickerShowRegistrationDate(true);
	};

	const onChangeRegistrationDate = (event, value) => {
		setDateRegistrationDate(value);
		setRegistrationDate(value);
		if (Platform.OS === 'android') {
			setIsPickerShowRegistrationDate(false);
		}
	};
	
	// Pick registration document here
	const pickRegistrationDocument = async () => {
		try {
			const documentSelection = await DocumentPicker.getDocumentAsync({ multiple: false, type: allowed_extensions });
			if (documentSelection.canceled === true) {
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "Cancelled file select"
				})
			} else {
				setPreviewRegistrationDocument({
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
					setRegistrationDocument(documentSelection.assets[0].uri);
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

	// Pick registration certificate here
	const pickRegistrationCertificate = async () => {
		try {
			const documentSelection = await DocumentPicker.getDocumentAsync({ multiple: false, type: allowed_extensions });
			if (documentSelection.canceled === true) {
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "Cancelled file select"
				})
			} else {
				setPreviewRegistrationCertificate({
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
					setRegistrationCertificate(documentSelection.assets[0].uri);
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

	async function UploadBusinessCertificate() {
		const _registration_date_ = new Date(registrationDate);
		const _registration_date = _registration_date_.getFullYear() + "-" + ((_registration_date_.getUTCMonth() + 1) < 10 ? "0" + (_registration_date_.getUTCMonth() + 1) : (_registration_date_.getUTCMonth() + 1)) + "-" + (_registration_date_.getDate() < 10 ? "0" + _registration_date_.getDate() : _registration_date_.getDate());
		if (!companyName) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Company Name is required"
			})
		} else if (companyName.length < 3 || companyName.length > 150) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Company Name | Invalid length"
			})
		} else if (!companyEmail) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Company Email is required"
			})
		} else if (!validate_email(companyEmail)) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Company email invalid"
			})
		} else if (!companyRcNumber) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Licence Number is required"
			})
		} else if (!validate_rc_number(companyRcNumber)) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Invalid Licence Number"
			})
		} else if (!companyAddress) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Company Address is required"
			})
		} else if (companyAddress.length < 3 || companyAddress.length > 200) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Company Address | Invalid length"
			})
		} else if (websiteUrl && !validate_url(websiteUrl)) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Website URL invalid"
			})
		} else if (!registrationDate) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Registration Date is required"
			})
		} else if (!validate_past_date(_registration_date)) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Invalid registration date"
			})
		} 
		// else if (!registrationDocument || registrationDocument.length === 0) {
		// 	Toast.show({
		// 		type: "error",
		// 		text1: "Error",
		// 		text2: "Registration Document is required"
		// 	})
		// } 
		else if (!registrationCertificate || registrationCertificate.length === 0) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Registration Certificate is required"
			})
		} else {
			setUploading(true);

			const userToken = await AsyncStorage.getItem('userToken');
			const userPID = await AsyncStorage.getItem('userPID');

			fetch(`${BaseUrl}/proofs/government/cac`, {
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
				const registration_document_rename = proof_res.data ? proof_res.data[1].registration_document : "1" + random_numbers(20);
				const registration_certificate_rename = proof_res.data ? proof_res.data[0].registration_certificate : "1" + random_numbers(20);
				
				fetch(`${BaseUrl}/user/cac/add`, {
					method: "POST",
					headers: {
						'passcoder-access-token': userToken,
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						company_name: return_trimmed_data(companyName),
						company_email: return_trimmed_data(companyEmail),
						company_rc_number: companyRcNumber,
						company_type: companyType,
						company_address: return_trimmed_data(companyAddress),
						website_url: websiteUrl && websiteUrl.length > 0 ? return_trimmed_data(websiteUrl) : undefined,
						registration_date: _registration_date
					})
				}).then(async (res) => {
					const upload_details_res = await res.json();

					if (upload_details_res.success) {
						const cac_verified_status = res.status === 201 ? false : true;

						let lastDotRegistrationDocument = registrationDocument.lastIndexOf('.');
						let extRegistrationDocument = registrationDocument.substring(lastDotRegistrationDocument + 1);

						let lastDotRegistrationCertificate = registrationCertificate.lastIndexOf('.');
						let extRegistrationCertificate = registrationCertificate.substring(lastDotRegistrationCertificate + 1);

						const new_registration_document_name = registration_document_rename + "." + extRegistrationDocument;
						const registration_document_path = "/users/" + new_registration_document_name;

						const new_registration_certificate_name = registration_certificate_rename + "." + extRegistrationCertificate;
						const registration_certificate_path = "/users/" + new_registration_certificate_name;

						if (registrationDocument && registrationDocument.length !== 0) {
							const reference_registration_document = storage().refFromURL(`${user_bucket_url}${new_registration_document_name}`);
							await reference_registration_document.putFile(registrationDocument).then(async () => {
								const url = await storage().refFromURL(`${user_bucket_url}${new_registration_document_name}`).getDownloadURL().then(async (res_registration_document) => {
									const reference_registration_certificate = storage().refFromURL(`${user_bucket_url}${new_registration_certificate_name}`);
									await reference_registration_certificate.putFile(registrationCertificate).then(async () => {
										const url = await storage().refFromURL(`${user_bucket_url}${new_registration_certificate_name}`).getDownloadURL().then((res_registration_certificate) => {
											fetch(`${BaseUrl}/user/cac/edit/proofs`, {
												method: "POST",
												headers: {
													'passcoder-access-token': userToken,
													'Accept': 'application/json',
													'Content-Type': 'application/json',
												},
												body: JSON.stringify({
													unique_id: upload_details_res.data.unique_id,
													registration_document: res_registration_document,
													registration_document_file_ext: registration_document_path,
													registration_certificate: res_registration_certificate,
													registration_certificate_file_ext: registration_certificate_path
												})
											}).then(async (res) => {
												const upload_proof_res = await res.json();
	
												if (upload_proof_res.success) {
													setUploading(false);
													Toast.show({
														type: "success",
														text1: "Success",
														text2: `Details uploaded ${cac_verified_status ? "& verified " : ""}successfully!`
													})
													nav.goBack();
												} else {
													setUploading(false);
													Toast.show({
														type: "error",
														text1: "Error",
														text2: res.status !== 422 ? upload_proof_res.message : upload_proof_res.data[0].msg
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
							const reference_registration_certificate = storage().refFromURL(`${user_bucket_url}${new_registration_certificate_name}`);
							await reference_registration_certificate.putFile(registrationCertificate).then(async () => {
								const url = await storage().refFromURL(`${user_bucket_url}${new_registration_certificate_name}`).getDownloadURL().then((res_registration_certificate) => {
									fetch(`${BaseUrl}/user/cac/edit/certificate`, {
										method: "POST",
										headers: {
											'passcoder-access-token': userToken,
											'Accept': 'application/json',
											'Content-Type': 'application/json',
										},
										body: JSON.stringify({
											unique_id: upload_details_res.data.unique_id,
											registration_certificate: res_registration_certificate,
											registration_certificate_file_ext: registration_certificate_path
										})
									}).then(async (res) => {
										const upload_proof_res = await res.json();

										if (upload_proof_res.success) {
											setUploading(false);
											Toast.show({
												type: "success",
												text1: "Success",
												text2: `Details uploaded ${cac_verified_status ? "& verified " : ""}successfully!`
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
						}
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

	const RenderCompanyTypeModal = () => {
		return (
			<Modal isVisible={companyTypeModal} onBackdropPress={() => setCompanyTypeModal(false)} onBackButtonPress={() => setCompanyTypeModal(false)} style={{ margin: 0 }}>
				<View style={{ flex: 1 }}>
					<View style={{ maxHeight: (Dimensions.get('screen').height * 70) / 100, width: Dimensions.get('screen').width, backgroundColor: "#fff", bottom: 0, position: "absolute" }}>
						<Text style={{ margin: 15, fontFamily: "lexendMedium", color: "red" }} onPress={() => setCompanyTypeModal(false)}>Cancel</Text>
						<View style={{ height: 5, width: Dimensions.get('screen').width, backgroundColor: "#eee" }} />
						<View style={{ margin: 15 }}>
							<ScrollView style={{ margin: 10 }} showsVerticalScrollIndicator={false}>
								<TouchableOpacity style={{ marginBottom: 20, marginRight: 10 }} onPress={() => {
									setCompanyType("BN");
									setCompanyTypeModal(false)
								}}>
									<View style={{ marginBottom: 20, marginRight: 10 }}>
										<Text style={{ fontFamily: "lexendBold", fontSize: 18, color: `${companyType === "BN" ? "blue" : null}` }}>{"BN"}</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity style={{ marginBottom: 20, marginRight: 10 }} onPress={() => {
									setCompanyType("RC");
									setCompanyTypeModal(false)
								}}>
									<View style={{ marginBottom: 20, marginRight: 10 }}>
										<Text style={{ fontFamily: "lexendBold", fontSize: 18, color: `${companyType === "RC" ? "blue" : null}` }}>{"RC"}</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity style={{ marginBottom: 20, marginRight: 10 }} onPress={() => {
									setCompanyType("IT");
									setCompanyTypeModal(false)
								}}>
									<View style={{ marginBottom: 20, marginRight: 10 }}>
										<Text style={{ fontFamily: "lexendBold", fontSize: 18, color: `${companyType === "IT" ? "blue" : null}` }}>{"IT"}</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity style={{ marginBottom: 20, marginRight: 10 }} onPress={() => {
									setCompanyType("LL");
									setCompanyTypeModal(false)
								}}>
									<View style={{ marginBottom: 20, marginRight: 10 }}>
										<Text style={{ fontFamily: "lexendBold", fontSize: 18, color: `${companyType === "LL" ? "blue" : null}` }}>{"LL"}</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity style={{ marginBottom: 20, marginRight: 10 }} onPress={() => {
									setCompanyType("LLP");
									setCompanyTypeModal(false)
								}}>
									<View style={{ marginBottom: 20, marginRight: 10 }}>
										<Text style={{ fontFamily: "lexendBold", fontSize: 18, color: `${companyType === "LLP" ? "blue" : null}` }}>{"LLP"}</Text>
									</View>
								</TouchableOpacity>
							</ScrollView>
						</View>
					</View>
				</View>
			</Modal>
		)
	};

	return (
		<>
			<RenderCompanyTypeModal />
			<View style={styles.wrapper}>
				{/*Top bar*/}
				<View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
					<View style={{ alignItems: "center" }}>
						<Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>CAC</Text>
						<Text style={{ fontFamily: "lexendLight" }}>Insert document details</Text>
					</View>
					<View />
				</View>

				<ScrollView style={{ marginBottom: 100 }}>
					<View style={{ margin: 15, marginTop: 30, marginBottom: 100 }}>
						<View style={{ marginBottom: 20 }}>
							<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Company Name *</Text>
							<TextInput
								onChangeText={(txt) => setCompanyName(txt)}
								maxLength={150}
								keyboardType='default'
								style={styles.inputStyle}
								placeholder="Enter Company's name"
							/>
						</View>
						<View style={{ marginBottom: 20 }}>
							<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Company Email *</Text>
							<TextInput
								onChangeText={(txt) => setCompanyEmail(txt)}
								keyboardType='email-address'
								style={styles.inputStyle}
								placeholder="Official Registered Email"
							/>
						</View>
						<View style={{ marginBottom: 20 }}>
							<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Company RC Number *</Text>
							<TextInput
								onChangeText={(txt) => setCompanyRcNumber(txt)}
								maxLength={14}
								keyboardType='number-pad'
								style={styles.inputStyle}
								placeholder='Enter RC Number'
							/>
						</View>
						<View style={{ marginBottom: 20 }}>
							<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Company Type *</Text>
							<TouchableOpacity onPress={() => { setCompanyTypeModal(true) }} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
								<Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{companyType || "Select Company Type"}</Text>
								<FontAwesome5 name="sort-down" size={24} color="grey" style={{ marginRight: 10, paddingBottom: 10 }} />
							</TouchableOpacity>
						</View>
						<View style={{ marginBottom: 20 }}>
							<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Company Address *</Text>
							<TextInput
								onChangeText={(txt) => setCompanyAddress(txt)}
								maxLength={200}
								keyboardType='default'
								style={styles.inputStyle}
								placeholder="Official Registered Address"
							/>
						</View>
						<View style={{ marginBottom: 20 }}>
							<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Website URL</Text>
							<TextInput
								onChangeText={(txt) => setWebsiteUrl(txt)}
								maxLength={200}
								keyboardType='default'
								style={styles.inputStyle}
								placeholder="Company's Website (if any)"
							/>
						</View>
						<View style={{ marginBottom: 20 }}>
							<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Registration Date *</Text>
							<TouchableOpacity onPress={showPickerRegistrationDate} style={{ flexDirection: "row", marginTop: 5, backgroundColor: "#eee", height: 45, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
								{(!isPickerShowRegistrationDate || Platform.OS === "android") && (
									<Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{registrationDate ? `${new Date(registrationDate).getFullYear()}-${(new Date(registrationDate).getUTCMonth() + 1) < 10 ? "0" + (new Date(registrationDate).getUTCMonth() + 1) : (new Date(registrationDate).getUTCMonth() + 1)}-${new Date(registrationDate).getDate() < 10 ? "0" + new Date(registrationDate).getDate() : new Date(registrationDate).getDate() }` : "YYYY-MM-DD"}</Text>
								)}
								{(isPickerShowRegistrationDate && Platform.OS === "ios") && (
									<DateTimePicker
										value={dateRegistrationDate}
										mode={'date'}
										maximumDate={new Date()}
										display={Platform.OS === 'ios' ? 'default' : 'spinner'}
										is24Hour={true}
										onChange={onChangeRegistrationDate}
									/>
								)}
								<Ionicons name="calendar-sharp" size={24} color="grey" style={{ marginRight: 10 }} />
							</TouchableOpacity>
						</View>

						<View style={{ marginBottom: 20 }}>
							<Text style={{ fontFamily: "lexendBold", marginBottom: 5 }}>Registration Certificate *</Text>
							<Text style={{ fontFamily: "lexendLight", marginBottom: 10 }}>Best to save images to pdf before upload!</Text>
							<TouchableOpacity onPress={pickRegistrationCertificate} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
								<Text style={{ fontFamily: "lexendBold", color: 'grey', paddingLeft: 20 }}>{previewRegistrationCertificate?.extension ? `${previewRegistrationCertificate?.extension + " - " + previewRegistrationCertificate?.size + "MB"}` : "Select File"}</Text>
								<Ionicons name="cloud-upload-outline" size={24} color="grey" style={{ marginRight: 10 }} />
							</TouchableOpacity>
						</View>

						{
							previewRegistrationCertificate?.extension && previewRegistrationCertificate?.extension !== "PDF" ?
								<View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
									<Image style={{ height: 250, width: 250 }} resizeMode='contain' source={{ uri: previewRegistrationCertificate?.file }} />
								</View> : ""
						}

						<View style={{ marginBottom: 20 }}>
							<Text style={{ fontFamily: "lexendBold", marginBottom: 5 }}>Registration Document</Text>
							<Text style={{ fontFamily: "lexendLight", marginBottom: 10 }}>Best to save images to pdf before upload!</Text>
							<TouchableOpacity onPress={pickRegistrationDocument} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
								<Text style={{ fontFamily: "lexendBold", color: 'grey', paddingLeft: 20 }}>{previewRegistrationDocument?.extension ? `${previewRegistrationDocument?.extension + " - " + previewRegistrationDocument?.size + "MB"}` : "Select File"}</Text>
								<Ionicons name="cloud-upload-outline" size={24} color="grey" style={{ marginRight: 10 }} />
							</TouchableOpacity>
						</View>

						{
							previewRegistrationDocument?.extension && previewRegistrationDocument?.extension !== "PDF" ?
								<View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
									<Image style={{ height: 250, width: 250 }} resizeMode='contain' source={{ uri: previewRegistrationDocument?.file }} />
								</View> : ""
						}
					</View>
				</ScrollView>

				<View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: 20 }}>
					<TouchableOpacity onPress={UploadBusinessCertificate} disabled={uploading} style={{ backgroundColor: AppColor.Blue, borderRadius: 8, height: 50, width: 300, justifyContent: "center", alignItems: "center" }}>
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
				{(isPickerShowRegistrationDate && Platform.OS === "android") && (
					<DateTimePicker
						value={dateRegistrationDate}
						mode={'date'}
						maximumDate={new Date()}
						display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
						is24Hour={true}
						onChange={onChangeRegistrationDate}
						style={styles.datePicker}
					/>
				)}
			</View>
		</>
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
	textInput: {
		height: 50,
		backgroundColor: AppColor.LightGrey,
		borderRadius: 12,
		paddingLeft: 20,
		fontFamily: "lexendBold",
		marginBottom: 20
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