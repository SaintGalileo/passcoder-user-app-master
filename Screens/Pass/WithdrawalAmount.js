import { ActivityIndicator, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppColor } from '../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import { count_filter, digit_filter, payment_methods, internal_character_key, passcoder_icon, random_numbers, return_trimmed_data } from '../../utils/Validations';

export default function WithdrawalAmount({ route }) {
	const { fundWithdrawMethod, passUser } = route.params;

	const nav = useNavigation();

	const general_min_amount = 1000;

	const [fundWithdrawAmount, setFundWithdrawAmount] = useState(null);

	function nextStep() {
		if (fundWithdrawAmount < general_min_amount) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Minimum amount is 1,000 Naira"
			});
		} else if (fundWithdrawAmount > passUser.balance_main) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: `Maximum amount is ${passUser.balance} Naira`
			});
		} else {
			nav.navigate("ConfirmWithdrawal", {
				fundWithdrawMethod: fundWithdrawMethod,
				fundWithdrawAmount: fundWithdrawAmount,
				passUser: passUser
			});
		}
	};

	return (
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View style={styles.wrapper}>
						{/*Top bar*/}
						<View style={{ flexDirection: "row", alignItems: "center", marginTop: 50, margin: 15 }}>
							<Feather name="arrow-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
							<Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, fontSize: Platform.OS === "ios" ? 20 : 15, marginLeft: 10 }}>Withdrawal</Text>
						</View>

						<View style={{ margin: 15, marginTop: 20 }}>
							<View style={{ marginBottom: 20 }}>
								<Text style={styles.topInfo}>Amount</Text>
								<TextInput
									value={fundWithdrawAmount}
									maxLength={11}
									onChangeText={(txt) => setFundWithdrawAmount(txt)}
									style={styles.inputStyle}
									keyboardType='numeric'
									placeholder='Enter amount (NGN)'
								/>
								{
									passUser ?
										<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginTop: 10, color: "red" }}>{"\u20A6"}{" "}1,000 - {"\u20A6"}{" "}{passUser?.balance}</Text> :
										<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginTop: 10 }}>Minimum {"\u20A6"}{" "}1,000</Text>
								}
							</View>
						</View>

						<View style={{ position: "absolute", bottom: 0, alignSelf: "flex-end", marginBottom: Platform.OS === "ios" ? 70 : 20 }}>
							<TouchableOpacity style={styles.btnStyle} onPress={nextStep}>
								<Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Next</Text>
							</TouchableOpacity>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
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