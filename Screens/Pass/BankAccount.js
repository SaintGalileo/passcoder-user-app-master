import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Dimensions, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Feather, Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppColor } from '../../utils/Color';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import Modal from "react-native-modal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { internal_character_key } from '../../utils/Validations';

export default function BankAccount() {

	const nav = useNavigation();
	const [loading, setLoading] = useState(false);

	const [editBankAccount, setEditBankAccount] = useState(false);

	const [passUser, setPassuser] = useState({});
	const [loadingProfile, setLoadingProfile] = useState(false);

	const [bankModal, setBankModal] = useState(false);
	const [loadingBanks, setLoadingBanks] = useState(false);
	const [fetchedBanks, setFetchedBanks] = useState([]);

	const [selectedBank, setSelectedBank] = useState(null);

	const [accountName, setAccountName] = useState('');
	const [accountNumber, setAccountNumber] = useState('');
	const [bank, setBank] = useState('');
	const [cbnCode, setCBNCode] = useState('');

	// get user profile
	async function GetCurrentUser() {
		setLoadingProfile(true);
		const userToken = await AsyncStorage.getItem('userToken');
		fetch(`${BaseUrl}/user/profile`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		}).then(async (res) => {
			const response = await res.json();
			setPassuser(response.data);
			if (response.data.account_name && response.data.account_number && response.data.bank) setAccountName(response.data.account_name); setAccountNumber(response.data.account_number); setBank(response.data.bank); setSelectedBank(response.data.bank); setEditBankAccount(true);
			setLoadingProfile(false);
		}).catch((err) => {
			setLoadingProfile(false);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Error occured - 100"
			})
		})
	};

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
		GetCurrentUser();
		GetBanks();
	}, []);

	async function AddOrEditBankAccount() {

		if (!accountName) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Account Name is required"
			})
		} else if (!accountNumber) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Account Number is required"
			})
		} else if (!bank) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Bank is required"
			})
		} else {
			const userToken = await AsyncStorage.getItem('userToken');
			setLoading(true);
			fetch(`${BaseUrl}/user/profile/bank/account`, {
				method: "PUT",
				headers: {
					'passcoder-access-token': userToken,
					'Accept': 'application/json',
					'Content-Type': 'application/json',

				},
				body: JSON.stringify({
					account_name: accountName,
					account_number: accountNumber,
					bank: bank,
					cbn_code: cbnCode
				})
			}).then(async (res) => {
				const response = await res.json();
				if (response.success === false) {
					setLoading(false);
					Toast.show({
						type: "error",
						text1: "Error",
						text2: res.status !== 422 ? response.message : response.data[0].msg
					})
				} else {
					setLoading(false);
					Toast.show({
						type: "success",
						text1: "Success",
						text2: "Bank details updated successfully"
					});
					nav.goBack();
				}
			}).catch((err) => {
				setLoading(false);
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
													setBank(bank?.bank_name);
													setCBNCode(bank?.cbn_code);
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
			{
				Platform.OS === "ios" ?
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} style={{ flex: 1, backgroundColor: "#fff" }}>
						<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
							<View style={{ flex: 1, backgroundColor: "#fff" }}>
								{/*Top*/}
								<View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
									<Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
									<View>
										<Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Bank Account</Text>
										<Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>Upload your bank details</Text>
									</View>
									<View>

									</View>
								</View>

								<View style={{ margin: 15 }}>
									<View style={{ marginBottom: 20 }}>
										<Text style={styles.topText}>Account Name</Text>
										<TextInput
											onChangeText={(txt) => setAccountName(txt)}
											maxLength={200}
											value={editBankAccount ? accountName : ""}
											style={styles.textInput}
											placeholder='Enter account name' />
									</View>

									<View style={{ marginBottom: 20 }}>
										<Text style={styles.topText}>Account Number</Text>
										<TextInput
											onChangeText={(txt) => setAccountNumber(txt)}
											style={styles.textInput}
											value={editBankAccount ? accountNumber : ""}
											maxLength={10}
											keyboardType='number-pad'
											placeholder='Enter account number' />
									</View>

									<View style={{ marginBottom: 20 }}>
										<Text style={styles.topText}>Bank</Text>
										<TouchableOpacity onPress={() => setBankModal(true)} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, marginTop: 10, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
											<Text style={{ fontFamily: "lexendMedium", color: `${selectedBank ? "#000" : "grey"}`, paddingLeft: 20, flexWrap: 'wrap', width: Dimensions.get('screen').width - 60 }}>{!selectedBank ? "Choose Bank" : selectedBank}</Text>
											<Entypo name="chevron-down" size={24} color="grey" style={{ marginRight: 10 }} />
										</TouchableOpacity>
									</View>
								</View>

								<View style={{ backgroundColor: "#FFFFFF", height: 90, bottom: 0, position: "absolute", width: Dimensions.get('screen').width }}>
									<View style={{ width: 300, flex: 1, alignSelf: "center", top: 20 }}>
										<TouchableOpacity disabled={loading || loadingBanks || loadingProfile} onPress={AddOrEditBankAccount} style={{ backgroundColor: loadingProfile ? "grey" : AppColor.Blue, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: "center" }}>
											{loading ? (
												<ActivityIndicator color={'#fff'} size={'small'} />
											) : (
												<Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Save</Text>
											)}
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</TouchableWithoutFeedback>
					</KeyboardAvoidingView> :
					<View style={{ flex: 1, backgroundColor: "#fff" }}>
						{/*Top*/}
						<View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
							<Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
							<View>
								<Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Bank Account</Text>
								<Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>Upload your bank details</Text>
							</View>
							<View>

							</View>
						</View>

						<View style={{ margin: 15 }}>
							<View style={{ marginBottom: 20 }}>
								<Text style={styles.topText}>Account Name</Text>
								<TextInput
									onChangeText={(txt) => setAccountName(txt)}
									maxLength={200}
									value={editBankAccount ? accountName : ""}
									style={styles.textInput}
									placeholder='Enter account name' />
							</View>

							<View style={{ marginBottom: 20 }}>
								<Text style={styles.topText}>Account Number</Text>
								<TextInput
									onChangeText={(txt) => setAccountNumber(txt)}
									style={styles.textInput}
									value={editBankAccount ? accountNumber : ""}
									maxLength={10}
									keyboardType='number-pad'
									placeholder='Enter account number' />
							</View>

							<View style={{ marginBottom: 20 }}>
								<Text style={styles.topText}>Bank</Text>
								<TouchableOpacity onPress={() => setBankModal(true)} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, marginTop: 10, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
									<Text style={{ fontFamily: "lexendMedium", color: `${selectedBank ? "#000" : "grey"}`, paddingLeft: 20, flexWrap: 'wrap', width: Dimensions.get('screen').width - 60 }}>{!selectedBank ? "Choose Bank" : selectedBank}</Text>
									<Entypo name="chevron-down" size={24} color="grey" style={{ marginRight: 10 }} />
								</TouchableOpacity>
							</View>
						</View>

						<View style={{ backgroundColor: "#FFFFFF", height: 90, bottom: 0, position: "absolute", width: Dimensions.get('screen').width }}>
							<View style={{width: 300, flex: 1, alignSelf: "center", top: 20 }}>
								<TouchableOpacity disabled={loading || loadingBanks || loadingProfile } onPress={AddOrEditBankAccount} style={{ backgroundColor: loadingProfile ? "grey": AppColor.Blue, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: "center" }}>
									{loading ? (
										<ActivityIndicator color={'#fff'} size={'small'} />
									) : (
										<Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Save</Text>
									)}
								</TouchableOpacity>
							</View>
						</View>
					</View>
			}
		</>
	)
}

const styles = StyleSheet.create({
	topText: {
		fontFamily: "lexendBold",
	},
	textInput: {
		backgroundColor: '#eee',
		height: 50,
		paddingLeft: 20,
		fontFamily: "lexendMedium",
		marginTop: 10,
		borderRadius: 8
	}
})