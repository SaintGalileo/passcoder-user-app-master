import { ActivityIndicator, Keyboard, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Entypo, Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppColor } from '../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import Modal from "react-native-modal";
import { count_filter, digit_filter, payment_methods, internal_character_key, passcoder_icon, random_numbers, return_trimmed_data } from '../../utils/Validations';

export default function BankTransferSend({ route }) {
	const { sendOption, passUser } = route.params;

	const nav = useNavigation();

	const [recipientAccountNumber, setRecipientAccountNumber] = useState("");
	const [recipientBank, setRecipientBank] = useState(null);
	const [recipientLoading, setRecipientLoading] = useState(false);
	const [recipientDetails, setRecipientDetails] = useState({});
	
	const [loadingBanks, setLoadingBanks] = useState(false);
	const [bankModal, setBankModal] = useState(false);
	const [fetchedBanks, setFetchedBanks] = useState([]);
	const [selectedBank, setSelectedBank] = useState(null);

	async function GetBanks() {
		setLoadingBanks(true);
		const userToken = await AsyncStorage.getItem('userToken');
		fetch(`${BaseUrl}/all/banks`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'passcoder-access-key': "passcoder_" + internal_character_key,
				'Accept': 'application/json',
				'Content-Type': 'application/json',

			}
		}).then(async (res) => {
			setLoadingBanks(false);
			const response = await res.json();
			if (response.success === false) {
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "Error getting mode for banks"
				})
			} else {
				setFetchedBanks(response.data);
			}
		}).catch((err) => {
			setLoadingBanks(false);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "An error occured!"
			})
		})
	};

	useEffect(() => {
		GetBanks();
	}, []);

	async function nextStep() {
		if (recipientAccountNumber.length !== 10) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Invalid Account Number"
			})
		} else if (!recipientBank) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Bank is required"
			})
		} else {
			setRecipientLoading(true);
			const userToken = await AsyncStorage.getItem('userToken');
			fetch(`${BaseUrl}/bank/transfer/validate/recipient`, {
				method: "POST",
				headers: {
					'passcoder-access-key': "passcoder_" + internal_character_key,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					bank_code: recipientBank.cbn_code,
					account_number: recipientAccountNumber.toString(),
				})
			}).then(async (res) => {
				const response = await res.json();
				if (response.success) {
					setRecipientLoading(false);
					setRecipientDetails({ ...response.data, account_name: return_trimmed_data(response.data.account_name), bank: recipientBank });
					nav.navigate("BankTransferSendDetails", {
						sendOption: sendOption,
						passUser: passUser,
						recipientDetails: { ...response.data, account_name: return_trimmed_data(response.data.account_name), bank: recipientBank }
					});
				} else {
					setRecipientLoading(false);
					Toast.show({
						type: "error",
						text1: "Error",
						text2: res.status !== 422 ? response.message : response.data[0].msg
					});
				}
			}).catch((err) => {
				setRecipientLoading(false);
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "An error occured!"
				});
			})
		}
	};

	const RenderBanks = () => {
		return (
			<Modal isVisible={bankModal} onBackdropPress={() => setBankModal(false)} onBackButtonPress={() => setBankModal(false)} style={{ margin: 0 }}>
				<View style={{ flex: 1 }}>
					<View style={{ maxHeight: (Dimensions.get('screen').height * 70) / 100, width: Dimensions.get('screen').width, backgroundColor: "#fff", bottom: 0, position: "absolute" }}>
						<Text style={{ margin: 15, fontFamily: "lexendMedium", color: "red" }} onPress={() => setBankModal(false)}>Cancel</Text>
						<View style={{ height: 5, width: Dimensions.get('screen').width, backgroundColor: "#eee" }} />
						<View style={{ margin: 15 }}>
							<ScrollView style={{ margin: 5, marginBottom: 30 }} showsVerticalScrollIndicator={false}>
								{
									fetchedBanks.length === 0 ?
										<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
											<Text style={{ fontFamily: "lexendBold", fontSize: 18 }}>No bank available</Text>
										</View> :
										fetchedBanks.map((bank, index) => (
											<>
												<TouchableOpacity key={index} style={{ margin: 15 }} onPress={() => {
													setSelectedBank(bank?.bank_name);
													setRecipientBank(bank);
													setBankModal(false);
												}}>
													<Text key={index} style={{ color: `${selectedBank === bank?.bank_name ? "blue" : ""}` }}>{bank?.bank_name}</Text>
												</TouchableOpacity>
												<View style={{ height: 2, width: Dimensions.get('screen').width, backgroundColor: "#eee" }} />
											</>
										))
								}
							</ScrollView>
						</View>
					</View>
				</View>
			</Modal>
		)
	};

	return (
		<>
			<RenderBanks />
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View style={styles.wrapper}>
						{/*Top bar*/}
						<View style={{ flexDirection: "row", alignItems: "center", marginTop: 50, margin: 15 }}>
							<Feather name="arrow-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
							<Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, fontSize: Platform.OS === "ios" ? 20 : 15, marginLeft: 10 }}>Send via {sendOption}</Text>
						</View>

						<View style={{ margin: 15, marginTop: 20 }}>
							<View style={{ marginBottom: 20 }}>
								<Text style={styles.topInfo}>Account Number</Text>
								<TextInput
									onChangeText={(txt) => setRecipientAccountNumber(txt)}
									style={styles.inputStyle}
									value={recipientAccountNumber}
									maxLength={10}
									keyboardType='number-pad'
									placeholder='Enter account number' />
							</View>
							<View style={{ marginBottom: 20 }}>
								<Text style={styles.topInfo}>Bank</Text>
								<TouchableOpacity onPress={() => setBankModal(true)} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
									<Text style={{ fontFamily: "lexendMedium", color: `${selectedBank ? "#000" : "grey"}`, paddingLeft: 20, flexWrap: 'wrap', width: Dimensions.get('screen').width - 60 }}>{!selectedBank ? "Choose Bank" : selectedBank}</Text>
									<Entypo name="chevron-down" size={24} color="grey" style={{ marginRight: 10 }} />
								</TouchableOpacity>
							</View>
						</View>

						<View style={{ position: "absolute", bottom: 0, alignSelf: "flex-end", marginBottom: Platform.OS === "ios" ? 70 : 20 }}>
							<TouchableOpacity style={{ ...styles.btnStyle, backgroundColor: recipientLoading ? "grey" : AppColor.Blue }} disabled={recipientLoading} onPress={nextStep}>
								{recipientLoading ? (
									<ActivityIndicator color={"#fff"} size={'small'} />
								) : (
									<Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Next</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</>
	)
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: "#fff"
	},
	topInfo: {
		fontFamily: "lexendBold",
		fontSize: 15,
		marginBottom: 5
	},
	inputStyle: {
		height: 50,
		borderRadius: 8,
		backgroundColor: "#eee",
		paddingLeft: 20,
		fontFamily: "lexendMedium",
		fontSize: 15
	},
	btnStyle: {
		height: 50,
		marginRight: 20,
		backgroundColor: AppColor.Blue,
		justifyContent: "center",
		alignItems: "center",
		width: (Dimensions.get('screen').width * 40) / 100,
		borderRadius: 8
	},
	textInput: {
		height: 50,
		backgroundColor: AppColor.LightGrey,
		borderRadius: 12,
		paddingLeft: 20,
		fontFamily: "lexendBold",
		marginBottom: 20
	}
})