import { ActivityIndicator, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppColor } from '../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import { count_filter, digit_filter, payment_methods, internal_character_key, passcoder_icon, random_numbers, return_trimmed_data } from '../../utils/Validations';

export default function ConfirmWithdrawal({ route }) {
	const { fundWithdrawMethod, fundWithdrawAmount, passUser } = route.params;

	const nav = useNavigation();

	function enterWalletPin() {
		nav.navigate("AuthorizeWithdrawal", {
			fundWithdrawMethod: fundWithdrawMethod,
			fundWithdrawAmount: fundWithdrawAmount,
			passUser: passUser
		});
	};

	const cancelWithdrawalPayment = () => {
		nav.navigate("Wallet");
	};

	return (
		<View style={styles.wrapper}>
			{/*Top bar*/}
			<View style={{ flexDirection: "row", alignItems: "center", marginTop: 50, margin: 15 }}>
				<Feather name="arrow-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
				<Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, fontSize: Platform.OS === "ios" ? 20 : 15, marginLeft: 10 }}>Payment Confirmation</Text>
			</View>

			<View style={{ flex: 1 }}>
				<View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
					<MaterialCommunityIcons name={"bank"} size={30} color={"green"} />
				</View>
				<View style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}>
					<Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 20, color: AppColor.Blue }}>Confirm Withdrawal</Text>
				</View>

				<View style={{ marginLeft: 15, marginRight: 15, marginBottom: 10 }}>
					<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
						<Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>Amount (NGN)</Text>
						<Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}><Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(fundWithdrawAmount ? fundWithdrawAmount : 0)}</Text>
					</View>
					<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
						<Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>Account Name</Text>
						<Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>{passUser.account_name}</Text>
					</View>
					<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
						<Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>Account Number</Text>
						<Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>{passUser.account_number}</Text>
					</View>
					<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
						<Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>Bank</Text>
						<Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>{passUser.bank}</Text>
					</View>
				</View>

				<View style={{ alignSelf: 'center', marginTop: 10, marginBottom: 20, }}>
					<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
						<TouchableOpacity onPress={() => cancelWithdrawalPayment()} style={{ backgroundColor: "red", height: 50, borderRadius: 8, width: (Dimensions.get("window").width * 40) / 100, justifyContent: "center", alignItems: "center", margin: 5 }}>
							<Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => enterWalletPin()} style={{ backgroundColor: AppColor.Blue, height: 50, borderRadius: 8, width: (Dimensions.get("window").width * 40) / 100, justifyContent: "center", alignItems: "center", margin: 5 }}>
							<Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Next</Text>
						</TouchableOpacity>
					</View>
				</View>
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