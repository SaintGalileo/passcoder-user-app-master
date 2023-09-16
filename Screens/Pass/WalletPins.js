import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Entypo, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Modal from "react-native-modal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import { AppColor } from '../../utils/Color';

export default function WalletPins() {
	const [showModal, setShowModal] = useState(false);
	const [resetLoading, setResetLoading] = useState(false);

	const [passUser, setPassuser] = useState({});
	const [loadingProfile, setLoadingProfile] = useState(false);

	//nav props
	const nav = useNavigation();

	// get user profile
	async function GetCurrentUser() {
		setLoadingProfile(true);
		const userToken = await AsyncStorage.getItem('userToken')
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
			setLoadingProfile(false);
		}).catch((err) => {
			setLoadingProfile(false);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Error occured - 100"
			})
		})
	}

	useEffect(() => {
		GetCurrentUser()
	}, []);

	//reset password
	async function ResetPassword() {
		setResetLoading(true)
		const userToken = await AsyncStorage.getItem('userToken');

		fetch(`${BaseUrl}/user/wallet/pin/reset`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		}).then(async (res) => {
			setResetLoading(false)
			setShowModal(false);
			nav.navigate('Check');
			const response = await res.json();
		}).catch((err) => {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Error occured - 100"
			})
		})
	};

	return (
		<View style={styles.wrapper}>

			<Modal isVisible={showModal} onBackdropPress={() => setShowModal(false)}>
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<View style={{ height: 400, width: 300, backgroundColor: "#fff", alignItems: "center", borderRadius: 8 }}>
						<Image
							style={{ marginTop: 15, height: 200, width: 200 }}
							resizeMode='contain'
							source={require('../../assets/img/shoot.png')}
						/>
						<Text style={{ fontFamily: "lexendMedium", fontSize: 25 }}>Reset Wallet Pin</Text>
						<Text style={{ textAlign: "center", fontFamily: "lexendLight", margin: 10 }}>Are you sure you want to reset your wallet pin?</Text>

						<View style={{ flexDirection: "row", alignItems: "center", top: 30 }}>
							<TouchableOpacity
								disabled={resetLoading}
								onPress={ResetPassword}
								style={{ backgroundColor: AppColor.Blue, borderRadius: 8, height: 40, width: 100, justifyContent: "center", alignItems: "center" }}>
								{resetLoading ? (
									<ActivityIndicator color={'#fff'} size={'small'} />
								) : (
									<Text style={{ fontFamily: "lexendMedium", color: "#fff" }}>YES</Text>
								)}
							</TouchableOpacity>
							<View style={{ width: 10 }} />
							<TouchableOpacity onPress={() => setShowModal(false)} style={{ borderWidth: 1.5, borderColor: AppColor.Blue, borderRadius: 8, height: 40, width: 100, justifyContent: "center", alignItems: "center" }}>
								<Text style={{ fontFamily: "lexendMedium", color: AppColor.Blue }}>NO</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			{/*Top bar*/}
			<View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
				<Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
				<View>
					<Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Wallet Pin</Text>
					<Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>Set up your wallet pin</Text>
				</View>
				<View>
				</View>
			</View>

			{
				loadingProfile ?
					<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
						<ActivityIndicator size={'large'} color={AppColor.Blue} />
					</View> :
					<>
						{/*Options*/}
						<View style={{ margin: 15, marginTop: 35 }}>

							{
								passUser?.wallet_pin ? 
									<>
										<TouchableOpacity style={styles.optionStyleAlt} disabled={true}>
											<MaterialCommunityIcons name="flag-checkered" size={24} color={"grey"} />
											<Text style={{ fontFamily: "lexendBold", fontSize: 18, color: "grey", flex: 1, marginLeft: 10 }}>Create Pin</Text>
										</TouchableOpacity> 

										<TouchableOpacity style={styles.optionStyle} onPress={() => nav.navigate('UpdateWalletPin')}>
											<MaterialCommunityIcons name="flag-checkered" size={24} color={"#3399ff"} />
											<Text style={{ fontFamily: "lexendBold", fontSize: 18, color: "grey", flex: 1, marginLeft: 10 }}>Update Pin</Text>
											<Entypo name="chevron-right" size={25} color="#7A7B7C" />
										</TouchableOpacity>

										<TouchableOpacity style={styles.optionStyle} onPress={() => setShowModal(true)}>
											<MaterialCommunityIcons name="flag-checkered" size={24} color={"#E52D1E"} />
											<Text style={{ fontFamily: "lexendBold", fontSize: 18, color: "grey", flex: 1, marginLeft: 10 }}>Reset Pin</Text>
											<Entypo name="chevron-right" size={25} color="#7A7B7C" />
										</TouchableOpacity>
									</> : 
									<>
										<TouchableOpacity style={styles.optionStyle} onPress={() => nav.navigate('CreateWalletPin')}>
											<MaterialCommunityIcons name="flag-checkered" size={24} color={"#33cc33"} />
											<Text style={{ fontFamily: "lexendBold", fontSize: 18, color: "grey", flex: 1, marginLeft: 10 }}>Create Transaction Pin</Text>
											<Entypo name="chevron-right" size={25} color="#7A7B7C" />
										</TouchableOpacity>

										<TouchableOpacity style={styles.optionStyleAlt} disabled={true}>
											<MaterialCommunityIcons name="flag-checkered" size={24} color={"grey"} />
											<Text style={{ fontFamily: "lexendBold", fontSize: 18, color: "grey", flex: 1, marginLeft: 10 }}>Update Pin</Text>
										</TouchableOpacity> 

										<TouchableOpacity style={styles.optionStyleAlt} disabled={true}>
											<MaterialCommunityIcons name="flag-checkered" size={24} color={"grey"} />
											<Text style={{ fontFamily: "lexendBold", fontSize: 18, color: "grey", flex: 1, marginLeft: 10 }}>Reset Pin</Text>
										</TouchableOpacity> 
									</>
							}
						</View>
					</>
			}

		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
	},
	optionStyle: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#fff",
		marginBottom: 20,
		padding: 20,
		borderRadius: 8
	},
	optionStyleAlt: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#d9d9d9",
		marginBottom: 20,
		padding: 20,
		borderRadius: 8
	}
})