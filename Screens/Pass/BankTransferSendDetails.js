import { ActivityIndicator, ScrollView, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppColor } from '../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import { count_filter, digit_filter, payment_methods, internal_character_key, passcoder_icon, random_numbers, return_trimmed_data } from '../../utils/Validations';

export default function BankTransferSendDetails({ route }) {
	const { sendOption, recipientDetails, passUser } = route.params;

	const nav = useNavigation();

	const general_min_amount = 50;

	const [sendPaymentAmount, setSendPaymentAmount] = useState(null);
	const [sendPaymentNote, setSendPaymentNote] = useState("");

	function nextStep() {
		if (!sendPaymentAmount) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: `Amount is required`
			});
		} else if (sendPaymentAmount > passUser.balance_main) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: `Maximum amount is ${passUser.balance} Naira`
			});
		} else if (sendPaymentNote.length !== 0 && sendPaymentNote.length > 100) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: `Max characters exceeded`
			});
		} else {
			nav.navigate("AuthorizeBankTransferPayment", {
				sendOption: sendOption,
				recipientDetails: recipientDetails,
				sendPaymentAmount: sendPaymentAmount,
				sendPaymentNote: sendPaymentNote.length === 0 ? null : return_trimmed_data(sendPaymentNote),
				passUser: passUser
			});
		}
	};

	return (
		Platform.OS === "ios" ?
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} style={styles.wrapper}>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss()}>
					<View style={styles.wrapper}>
						{/*Top bar*/}
						<View style={{ flexDirection: "row", alignItems: "center", marginTop: 50, margin: 15 }}>
							<Feather name="arrow-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
							<Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, fontSize: Platform.OS === "ios" ? 20 : 15, marginLeft: 10 }}>Payment Details</Text>
						</View>

						<ScrollView style={{ marginBottom: 90, }} showsVerticalScrollIndicator={false}>
							<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", marginLeft: 15, marginRight: 15 }}>
								<View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 10 }}>
									<MaterialCommunityIcons name={"bank"} size={30} color={AppColor.Blue} />
								</View>
								<View style={{ marginLeft: 15, marginRight: 15, marginTop: 10 }}>
									<Text style={{ fontFamily: 'lexendMedium', fontSize: 17, marginBottom: 10, color: "#000", flexWrap: 'wrap', maxWidth: (Dimensions.get('screen').width * 70) / 100 }}>{recipientDetails.account_name}</Text>
									<Text style={{ fontFamily: 'lexendLight', fontSize: 14, marginBottom: 5, color: "#000" }}>{recipientDetails.bank.bank_name}</Text>
									<Text style={{ fontFamily: 'lexendLight', fontSize: 14, marginBottom: 5, color: "#000" }}>{recipientDetails.account_number}</Text>
								</View>
							</View>

							<View style={{ margin: 15, marginTop: 20 }}>
								<View style={{ marginBottom: 20 }}>
									<Text style={styles.topInfo}>Amount</Text>
									<TextInput
										value={sendPaymentAmount}
										maxLength={11}
										onChangeText={(txt) => setSendPaymentAmount(txt)}
										style={styles.inputStyle}
										keyboardType='numeric'
										placeholder='Enter amount (NGN)'
									/>
									{
										passUser ?
											<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginTop: 10, color: "grey" }}>Balance - {"\u20A6"}{" "}{passUser?.balance}</Text> :
											<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginTop: 10 }}>Balance - {"\u20A6"}{" "}0</Text>
									}
								</View>

								<View style={{ marginBottom: 20 }}>
									<Text style={styles.topInfo}>Note</Text>
									<TextInput
										onChangeText={(txt) => setSendPaymentNote(txt)}
										maxLength={100}
										value={sendPaymentNote}
										style={styles.inputStyle}
										placeholder='Remarks (optional)'
									/>
									<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginTop: 10 }}>{sendPaymentNote.length} / 100</Text>
								</View>
							</View>
						</ScrollView>

						<View style={{ position: "absolute", bottom: 0, alignSelf: "flex-end", marginBottom: Platform.OS === "ios" ? 70 : 20 }}>
							<TouchableOpacity style={styles.btnStyle} onPress={nextStep}>
								<Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Send</Text>
							</TouchableOpacity>
						</View>

					</View>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView> :
			<View style={styles.wrapper}>
				{/*Top bar*/}
				<View style={{ flexDirection: "row", alignItems: "center", marginTop: 50, margin: 15 }}>
					<Feather name="arrow-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
					<Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, fontSize: Platform.OS === "ios" ? 20 : 15, marginLeft: 10 }}>Payment Details</Text>
				</View>

				<ScrollView style={{ marginBottom: 90, }} showsVerticalScrollIndicator={false}>
					<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", marginLeft: 15, marginRight: 15 }}>
						<View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 10 }}>
							<MaterialCommunityIcons name={"bank"} size={30} color={AppColor.Blue} />
						</View>
						<View style={{ marginLeft: 15, marginRight: 15, marginTop: 10 }}>
							<Text style={{ fontFamily: 'lexendMedium', fontSize: 17, marginBottom: 10, color: "#000", flexWrap: 'wrap', maxWidth: (Dimensions.get('screen').width * 70) / 100 }}>{recipientDetails.account_name}</Text>
							<Text style={{ fontFamily: 'lexendLight', fontSize: 14, marginBottom: 5, color: "#000" }}>{recipientDetails.bank.bank_name}</Text>
							<Text style={{ fontFamily: 'lexendLight', fontSize: 14, marginBottom: 5, color: "#000" }}>{recipientDetails.account_number}</Text>
						</View>
					</View>

					<View style={{ margin: 15, marginTop: 20 }}>
						<View style={{ marginBottom: 20 }}>
							<Text style={styles.topInfo}>Amount</Text>
							<TextInput
								value={sendPaymentAmount}
								maxLength={11}
								onChangeText={(txt) => setSendPaymentAmount(txt)}
								style={styles.inputStyle}
								keyboardType='numeric'
								placeholder='Enter amount (NGN)'
							/>
							{
								passUser ?
									<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginTop: 10, color: "grey" }}>Balance - {"\u20A6"}{" "}{passUser?.balance}</Text> :
									<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginTop: 10 }}>Balance - {"\u20A6"}{" "}0</Text>
							}
						</View>

						<View style={{ marginBottom: 20 }}>
							<Text style={styles.topInfo}>Note</Text>
							<TextInput
								onChangeText={(txt) => setSendPaymentNote(txt)}
								maxLength={100}
								value={sendPaymentNote}
								style={styles.inputStyle}
								placeholder='Remarks (optional)'
							/>
							<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginTop: 10 }}>{sendPaymentNote.length} / 100</Text>
						</View>
					</View>
				</ScrollView>

				<View style={{ position: "absolute", bottom: 0, alignSelf: "flex-end", marginBottom: Platform.OS === "ios" ? 70 : 20 }}>
					<TouchableOpacity style={styles.btnStyle} onPress={nextStep}>
						<Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Send</Text>
					</TouchableOpacity>
				</View>

			</View>
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