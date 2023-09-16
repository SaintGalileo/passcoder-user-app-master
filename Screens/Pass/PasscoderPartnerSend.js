import { ActivityIndicator, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppColor } from '../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import { count_filter, digit_filter, payment_methods, internal_character_key, passcoder_icon, random_numbers, return_trimmed_data } from '../../utils/Validations';

export default function PasscoderPartnerSend({ route }) {
	const { sendOption, passUser } = route.params;

	const nav = useNavigation();

	const [sendPaymentPID, setSendPaymentPID] = useState("");
	const [recipientPartnerLoading, setRecipientPartnerLoading] = useState(false);
	const [recipientPartnerDetails, setRecipientPartnerDetails] = useState({});

	async function nextStep() {
		if (sendPaymentPID === passUser.pid) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Really? To yourself ???"
			})
		} else if (sendPaymentPID.length === 6) {
			setRecipientPartnerLoading(true);
			const userToken = await AsyncStorage.getItem('userToken');
			fetch(`${BaseUrl}/public/find/partner`, {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					pid: sendPaymentPID,
				})
			}).then(async (res) => {
				const response = await res.json();
				if (response.success) {
					setRecipientPartnerLoading(false);
					setRecipientPartnerDetails(response.data);
					nav.navigate("PasscoderPartnerSendDetails", {
						sendOption: sendOption,
						sendPaymentPID: sendPaymentPID,
						passUser: passUser,
						recipientPartnerDetails: response.data
					});
				} else {
					setRecipientPartnerLoading(false);
					Toast.show({
						type: "error",
						text1: "Error",
						text2: res.status !== 422 ? response.message : response.data[0].msg
					});
				}
			}).catch((err) => {
				setRecipientPartnerLoading(false);
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "An error occured!"
				});
			})
		} else {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "PID must be 6 digits"
			})
		} 
	};

	return (
		<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View style={styles.wrapper}>
					{/*Top bar*/}
					<View style={{ flexDirection: "row", alignItems: "center", marginTop: 50, margin: 15 }}>
						<Feather name="arrow-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
						<Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, fontSize: Platform.OS === "ios" ? 20 : 15, marginLeft: 10 }}>Send to {sendOption}</Text>
					</View>

					<View style={{ margin: 15, marginTop: 20 }}>
						<View style={{ marginBottom: 20 }}>
							<Text style={styles.topInfo}>Enter recipient Passcoder ID</Text>
							<TextInput
								value={sendPaymentPID}
								autoCapitalize='characters'
								maxLength={6}
								onChangeText={(txt) => setSendPaymentPID(txt)}
								style={styles.inputStyle}
								keyboardType='default'
								placeholder='Enter Passcoder ID'
							/>
						</View>
					</View>

					<View style={{ position: "absolute", bottom: 0, alignSelf: "flex-end", marginBottom: Platform.OS === "ios" ? 70 : 20 }}>
						<TouchableOpacity style={{ ...styles.btnStyle, backgroundColor: recipientPartnerLoading ? "grey" : AppColor.Blue }} disabled={recipientPartnerLoading} onPress={nextStep}>
							{recipientPartnerLoading ? (
								<ActivityIndicator color={"#fff"} size={'small'} />
							) : (
								<Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Next</Text>
							)}
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