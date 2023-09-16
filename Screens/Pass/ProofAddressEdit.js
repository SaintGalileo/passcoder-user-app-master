import { ScrollView, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ActivityIndicator, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native'
import { AppColor } from '../../utils/Color'
import { StateData } from '../../Data/Credentials'
import Toast from 'react-native-toast-message';
import Modal from "react-native-modal";
import storage from '@react-native-firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import DateTimePicker from '@react-native-community/datetimepicker';
import { user_bucket_url, allowed_extensions, maximum_file_size, random_numbers, validate_past_date, return_trimmed_data } from '../../utils/Validations';

export default function ProofAddressEdit({ route }) {

	const nav = useNavigation();
	const [stateModal, setStateModal] = useState(false);
	const [cityModal, setCityModal] = useState(false);
	const [modalVisible, setModalVisible] = useState(false)
	const [preview, setPreview] = useState({})
	const [uploading, setUploading] = useState(false)
	const [stateCity, setStateCity] = useState([])

	const [address, setAddress] = useState('');
	const [additionalInfo, setAdditionalInfo] = useState('');
	const [street, setStreet] = useState('');
	const [state, setState] = useState('');
	const [city, setCity] = useState('');
	const [country, setCountry] = useState('Nigeria');
	const [issuedDate, setIssuedDate] = useState('');
	const [proof, setProof] = useState('');
	const [proofType, setProofType] = useState('');

	const [verified, setVerified] = useState(false);

	const [oldProof, setOldProof] = useState(null);
	const [oldProofExt, setOldProofExt] = useState(null);

	const [isPickerShowIssuedDate, setIsPickerShowIssuedDate] = useState(false);
	const [dateIssuedDate, setDateIssuedDate] = useState(new Date(Date.now()));

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

	let address_proof_types = ["Utility Bill", "Bank Statement", "Water Bill"];

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

	async function GetUserAddress() {
		const userToken = await AsyncStorage.getItem('userToken');
		fetch(`${BaseUrl}/user/address`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',

			}
		}).then(async (res) => {
			const response = await res.json();
			setAddress(response.data.address);
			setAdditionalInfo(response.data.additional_information);
			setStreet(response.data.street);
			setState(response.data.state);
			setCity(response.data.city);
			setCountry(response.data.country);
			setProofType(response.data.proof_type);
			setIssuedDate(response.data.issued_date);
			setDateIssuedDate(new Date(response.data.issued_date));
			
			setVerified(response?.data?.verified);
			setOldProof(response?.data?.proof);

			let lastDotOldProof = response.data.proof ? response.data.proof.lastIndexOf('.') : null;
			let extOldProof = response.data.proof ? response.data.proof.substring(lastDotOldProof + 1) : null;
			setOldProofExt(extOldProof ? extOldProof.toUpperCase() : null);
		}).catch((err) => {
			Toast.show({
				type: 'error',
				text1: "Error",
				text2: "An error occured!"
			})
		})
	}

	useEffect(() => {
		GetUserAddress()
	}, []);

	async function EditAddress() {
		const _issued_date_ = new Date(issuedDate);
		const _issued_date = _issued_date_.getFullYear() + "-" + ((_issued_date_.getUTCMonth() + 1) < 10 ? "0" + (_issued_date_.getUTCMonth() + 1) : (_issued_date_.getUTCMonth() + 1)) + "-" + (_issued_date_.getDate() < 10 ? "0" + _issued_date_.getDate() : _issued_date_.getDate());
		//new start
		if (!address) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Address is required"
			})
		} else if (!street) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Street is required"
			})
		} else if (!state) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "State is required"
			})
		} else if (!city) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "City is required"
			})
		} else if (!country) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Country is required"
			})
		} else if (!issuedDate) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Issued date is required"
			})
		} else if (!proofType) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Proof type is required"
			})
		} else if (!validate_past_date(_issued_date)) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Issued date is invalid"
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
			const userUID = await AsyncStorage.getItem('userUID');

			fetch(`${BaseUrl}/proofs/bio/address${!userPID || userPID === "******" ? "/via/uid" : ""}`, {
				method: "POST",
				headers: {
					'passcoder-access-token': userToken,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(
					!userPID || userPID === "******" ? {
						uid: userUID,
						proof_type: proofType
					} : {
						pid: userPID,
						proof_type: proofType
					}
				)
			}).then(async (res) => {
				const proof_res = await res.json();
				const proof_rename = proof_res.data ? proof_res.data[0].proof : "1" + random_numbers(20);

				fetch(`${BaseUrl}/user/address/edit/all`, {
					method: "PUT",
					headers: {
						'passcoder-access-token': userToken,
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						unique_id: route.params.unique_id,
						address: return_trimmed_data(address),
						street: return_trimmed_data(street),
						city: city,
						state: state,
						country: country,
						issued_date: _issued_date,
						proof_type: proofType,
						additional_information: additionalInfo && additionalInfo.length > 0 ? additionalInfo : undefined
					})
				}).then(async (res) => {
					if (res.status === 200) {
						if (proof) {
							let lastDot = proof.lastIndexOf('.');
							let ext = proof.substring(lastDot + 1);

							const new_proof_name = proof_rename + "." + ext;
							const proof_path = "/users/" + new_proof_name;

							const reference = storage().refFromURL(`${user_bucket_url}${new_proof_name}`);
							await reference.putFile(proof).then(async () => {
								const url = await storage().refFromURL(`${user_bucket_url}${new_proof_name}`).getDownloadURL().then((res) => {

									fetch(`${BaseUrl}/user/address/edit/proof`, {
										method: "POST",
										headers: {
											'passcoder-access-token': userToken,
											'Accept': 'application/json',
											'Content-Type': 'application/json',
										},
										body: JSON.stringify({
											unique_id: route.params.unique_id,
											proof: res,
											proof_file_ext: proof_path,
											issued_date: _issued_date,
											proof_type: proofType
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
						setUploading(false);
						Toast.show({
							type: "error",
							text1: "Error",
							text2: res.status !== 422 ? "Error occured while updating" : await res.json().data.msg
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
		//new end
	}

	//render state modal
	const RenderStateModal = () => {
		return (
			<Modal isVisible={stateModal} onBackdropPress={() => setStateModal(false)} onBackButtonPress={() => setStateModal(false)} style={{ margin: 0 }}>
				<View style={{ flex: 1 }}>
					<View style={{ maxHeight: (Dimensions.get('screen').height * 70) / 100, width: Dimensions.get('screen').width, backgroundColor: "#fff", bottom: 0, position: "absolute" }}>
						<Text style={{ margin: 15, fontFamily: "lexendMedium", color: "red" }} onPress={() => setStateModal(false)}>Cancel</Text>
						<View style={{ height: 5, width: Dimensions.get('screen').width, backgroundColor: "#eee" }} />
						<View style={{ margin: 15 }}>
							<ScrollView style={{ margin: 10, marginBottom: 30 }} showsVerticalScrollIndicator={false}>
								{StateData.map((state_, index) => (
									<TouchableOpacity key={index} style={{ marginBottom: 20, marginRight: 10 }} onPress={() => {
										setState(state_.name);
										setCity('');
										setStateCity(state_.lgas)
										setStateModal(false)
									}}>
										<View style={{ marginBottom: 20, marginRight: 10 }}>
											<Text style={{ fontFamily: "lexendBold", fontSize: 18, color: `${state === state_.name ? "blue" : null}` }}>{state_.name}</Text>
										</View>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>
					</View>
				</View>
			</Modal>
		)
	}

	const RenderCityModal = () => {
		return (
			<Modal isVisible={cityModal} onBackdropPress={() => setCityModal(false)} onBackButtonPress={() => setCityModal(false)} style={{ margin: 0 }}>
				<View style={{ flex: 1 }}>
					<View style={{ maxHeight: (Dimensions.get('screen').height * 70) / 100, width: Dimensions.get('screen').width, backgroundColor: "#fff", bottom: 0, position: "absolute" }}>
						<Text style={{ margin: 15, fontFamily: "lexendMedium", color: "red" }} onPress={() => setCityModal(false)}>Cancel</Text>
						<View style={{ height: 5, width: Dimensions.get('screen').width, backgroundColor: "#eee" }} />
						<View style={{ margin: 15 }}>
							<ScrollView style={{ margin: 10, marginBottom: 30 }} showsVerticalScrollIndicator={false}>
								{stateCity.length === 0 ?
									<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
										<Text style={{ fontFamily: "lexendBold", fontSize: 18 }}>Select State</Text>
									</View> :
									stateCity.map((state, index) => (
										<TouchableOpacity key={index} style={{ marginBottom: 20, marginRight: 10 }} onPress={() => {
											setCity(state);
											setCityModal(false)
										}}>
											<View style={{ marginBottom: 20, marginRight: 10 }}>
												<Text style={{ fontFamily: "lexendBold", fontSize: 18, color: `${city === state ? "blue" : null}` }}>{state}</Text>
											</View>
										</TouchableOpacity>
									))}
							</ScrollView>
						</View>
					</View>
				</View>
			</Modal>
		)
	}

	const Showmodal = () => {
		return (
			<Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)} onBackButtonPress={() => setModalVisible(false)} style={{ margin: 0 }}>
				<View style={{ flex: 1 }}>
					<View style={{ maxHeight: (Dimensions.get('screen').height * 70) / 100, width: Dimensions.get('screen').width, backgroundColor: "#fff", bottom: 0, position: "absolute" }}>
						<Text style={{ margin: 15, fontFamily: "lexendMedium", color: "red" }} onPress={() => setModalVisible(false)}>Cancel</Text>
						<View style={{ height: 5, width: Dimensions.get('screen').width, backgroundColor: "#eee" }} />
						<View style={{ margin: 15 }}>
							<ScrollView style={{ margin: 10 }} showsVerticalScrollIndicator={false}>
								{
									address_proof_types.map((proof, index) =>
										<TouchableOpacity key={index} style={{ marginBottom: 20, marginRight: 10 }} onPress={() => {
											setProofType(proof);
											setModalVisible(false);
										}}>
											<View style={{ marginBottom: 20, marginRight: 10 }}>
												<Text style={{ fontFamily: "lexendBold", fontSize: 18, color: `${proofType === proof ? "blue" : null}` }}>{proof}</Text>
											</View>
										</TouchableOpacity>
									)
								}
							</ScrollView>
						</View>
					</View>
				</View>
			</Modal>
		)
	}

	return (
		<>
			<Showmodal />
			<RenderStateModal />
			<RenderCityModal />
			<View style={styles.wrapper}>

				{/*Top bar*/}
				<View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
					<View style={{ alignItems: "center" }}>
						<Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>Address</Text>
						<Text style={{ fontFamily: "lexendLight" }}>Upload your address</Text>
					</View>
					<View />
				</View>

				<ScrollView style={{ marginBottom: 100 }}>
					<View style={{ margin: 15 }}>
						<View style={{ marginBottom: 20 }}>
							<Text style={styles.infoText}>Address</Text>
							<TextInput
								onChangeText={(txt) => setAddress(txt)}
								value={address}
								style={styles.inputStyle}
								placeholder='Enter address'
							/>
						</View>
						<View style={{ marginBottom: 20 }}>
							<Text style={styles.infoText}>Additional Information</Text>
							<TextInput
								onChangeText={(txt) => setAdditionalInfo(txt)}
								value={additionalInfo}
								style={styles.inputStyle}
								placeholder='Enter Additional Information'
							/>
						</View>
						<View style={{ marginBottom: 20 }}>
							<Text style={styles.infoText}>Street</Text>
							<TextInput
								onChangeText={(txt) => setStreet(txt)}
								value={street}
								style={styles.inputStyle}
								placeholder='Enter street'
							/>
						</View>

						<View style={{ marginBottom: 20 }}>
							<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>State</Text>
							<TouchableOpacity onPress={() => { setStateModal(true) }} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
								<Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{state || "Select State"}</Text>
								<FontAwesome5 name="sort-down" size={24} color="grey" style={{ marginRight: 10, paddingBottom: 10 }} />
							</TouchableOpacity>
						</View>

						<View style={{ marginBottom: 20 }}>
							<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>City</Text>
							<TouchableOpacity onPress={() => { setCityModal(true) }} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
								<Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{city || "Select City"}</Text>
								<FontAwesome5 name="sort-down" size={24} color="grey" style={{ marginRight: 10, paddingBottom: 10 }} />
							</TouchableOpacity>
						</View>

						<View style={{ marginBottom: 20 }}>
							<Text style={styles.infoText}>Country</Text>
							<TextInput
								editable={false}
								onChangeText={(txt) => { setCountry(txt) }}
								style={[styles.inputStyle, { textTransform: 'capitalize' }]}
								value={country}
								placeholder='Enter Country'
							/>
						</View>

						<View style={{ marginBottom: 20 }}>
							<Text style={styles.infoText}>Issued Date</Text>
							<TouchableOpacity onPress={showPickerIssuedDate} style={{ flexDirection: "row", marginTop: 15, backgroundColor: "#eee", height: 45, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
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
							<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Proof Type</Text>
							<TouchableOpacity onPress={() => { setModalVisible(true) }} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
								<Text style={{ fontFamily: "lexendMedium", color: 'black', paddingLeft: 20 }}>{proofType}</Text>
								<FontAwesome5 name="sort-down" size={24} color="grey" style={{ marginRight: 10, paddingBottom: 10 }} />
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
							<Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Proof</Text>
							<TouchableOpacity onPress={pickProof} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
								<Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{preview?.extension ? `${preview?.extension + " - " + preview?.size + "MB"}` : "Upload Document"}</Text>
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
							<TouchableOpacity onPress={EditAddress} disabled={uploading} style={styles.uploadButton}>
								{uploading ? (
									<ActivityIndicator color={"#fff"} size={'small'} />
								) : (
									<Text style={{ fontFamily: 'lexendMedium', color: "#fff" }}>Save Changes</Text>
								)}
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
			</View>
		</>

	)
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: "#fff"
	},
	infoText: {
		fontFamily: "lexendBold",
	},
	inputStyle: {
		height: 50,
		backgroundColor: "#eee",
		paddingLeft: 20,
		paddingRight: 20,
		borderRadius: 8,
		marginTop: 10,
		fontFamily: "lexendMedium"
	},
	btn: {
		backgroundColor: AppColor.Blue,
		height: 50,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",

	},
	uploadButton: {
		width: 300,
		height: 45,
		borderRadius: 8,
		backgroundColor: AppColor.Blue,
		justifyContent: "center",
		alignItems: "center"
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