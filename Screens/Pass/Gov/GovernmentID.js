import { ActivityIndicator, StyleSheet, Text, Image, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Entypo, Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import { AppColor } from '../../../utils/Color';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BaseUrl } from '../../../utils/Url';
import { CredData, GovData } from '../../../Data/Credentials';

export default function GovernmentID() {

	const nav = useNavigation();

	const [taxRecordLoading, setTaxRecordLoading] = useState(false);
	const [businessCertificateLoading, setBusinessCertificateLoading] = useState(false);
	const [driverLicenceLoading, setDriverLicenceLoading] = useState(false);
	const [voterCardLoading, setVoterCardLoading] = useState(false);
	const [passportLoading, setPassportLoading] = useState(false);

	function RenderLeftIcon({ screen }) {
		if (screen === "TaxRecords") {
			return (
				<View>
					{taxRecordLoading ? (
						<ActivityIndicator color={AppColor.Blue} size={'small'} />
					) : (
						<Entypo name="chevron-right" size={24} color="#7A7B7C" />
					)}
				</View>
			)
		} else if (screen === "BusinessCertificates") {
			return (
				<View>
					{businessCertificateLoading ? (
						<ActivityIndicator color={AppColor.Blue} size={'small'} />
					) : (
						<Entypo name="chevron-right" size={24} color="#7A7B7C" />
					)}
				</View>
			)
		} else if (screen === "DriverLicence") {
			return (
				<View>
					{driverLicenceLoading ? (
						<ActivityIndicator color={AppColor.Blue} size={'small'} />
					) : (
						<Entypo name="chevron-right" size={24} color="#7A7B7C" />
					)}
				</View>
			)
		} else if (screen === "VoterCard") {
			return (
				<View>
					{voterCardLoading ? (
						<ActivityIndicator color={AppColor.Blue} size={'small'} />
					) : (
						<Entypo name="chevron-right" size={24} color="#7A7B7C" />
					)}
				</View>
			)
		} else if (screen === "Passport") {
			return (
				<View>
					{passportLoading ? (
						<ActivityIndicator color={AppColor.Blue} size={'small'} />
					) : (
						<Entypo name="chevron-right" size={24} color="#7A7B7C" />
					)}
				</View>
			)
		}
	}

	async function NextScreen(screen) {
		if (screen === 'DriverLicence') {
			const userToken = await AsyncStorage.getItem('userToken')
			setDriverLicenceLoading(true);
			fetch(`${BaseUrl}/user/driver/licence`, {
				method: "POST",
				headers: {
					'passcoder-access-token': userToken,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				}
			}).then(async (res) => {
				const response = await res.json();
				if (res.status === 400) {
					setDriverLicenceLoading(false);
					nav.navigate("AddDriverLicence");
				} else if (response.success === true) {
					setDriverLicenceLoading(false)
					nav.navigate('DriverLicence')
				} else {
					setDriverLicenceLoading(false)
					Toast.show({
						type: "error",
						text1: "Error",
						text2: "An error occured!"
					})
				}
			}).catch((err) => {
				setDriverLicenceLoading(false)
			})
		} else if (screen === 'VoterCard') {
			const userToken = await AsyncStorage.getItem('userToken')
			setVoterCardLoading(true);
			fetch(`${BaseUrl}/user/voter/card`, {
				method: "POST",
				headers: {
					'passcoder-access-token': userToken,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				}
			}).then(async (res) => {
				const response = await res.json();
				if (res.status === 400) {
					setVoterCardLoading(false);
					nav.navigate("AddVoterCard");
				} else if (response.success === true) {
					setVoterCardLoading(false)
					nav.navigate('VoterCard')
				} else {
					setVoterCardLoading(false)
					Toast.show({
						type: "error",
						text1: "Error",
						text2: "An error occured!"
					})
				}
			}).catch((err) => {
				setVoterCardLoading(false)
			})
		} else if (screen === 'Passport') {
			const userToken = await AsyncStorage.getItem('userToken')
			setPassportLoading(true);
			fetch(`${BaseUrl}/user/passport`, {
				method: "POST",
				headers: {
					'passcoder-access-token': userToken,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				}
			}).then(async (res) => {
				const response = await res.json();
				if (res.status === 400) {
					setPassportLoading(false);
					nav.navigate("AddPassport");
				} else if (response.success === true) {
					setPassportLoading(false)
					nav.navigate('Passport')
				} else {
					setPassportLoading(false)
					Toast.show({
						type: "error",
						text1: "Error",
						text2: "An error occured!"
					})
				}
			}).catch((err) => {
				setPassportLoading(false)
			})
		} else if (screen === 'TaxRecords') {
			const userToken = await AsyncStorage.getItem('userToken')
			setTaxRecordLoading(true);
			fetch(`${BaseUrl}/user/tax/records`, {
				method: "POST",
				headers: {
					'passcoder-access-token': userToken,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				}
			}).then(async (res) => {
				const response = await res.json();
				if (res.status === 400) {
					setTaxRecordLoading(false);
					nav.navigate("AddTaxRecord");
				} else if (response.success === true) {
					setTaxRecordLoading(false)
					nav.navigate('TaxRecords')
				} else {
					setTaxRecordLoading(false)
					Toast.show({
						type: "error",
						text1: "Error",
						text2: "An error occured!"
					})
				}
			}).catch((err) => {
				setTaxRecordLoading(false);
			})
		} else if (screen === 'BusinessCertificates') {
			const userToken = await AsyncStorage.getItem('userToken')
			setBusinessCertificateLoading(true);
			fetch(`${BaseUrl}/user/cac/all`, {
				method: "POST",
				headers: {
					'passcoder-access-token': userToken,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				}
			}).then(async (res) => {
				const response = await res.json();
				if (res.status === 400) {
					setBusinessCertificateLoading(false);
					nav.navigate("AddBusinessCertificate");
				} else if (response.success === true) {
					setBusinessCertificateLoading(false)
					nav.navigate('BusinessCertificates')
				} else {
					setBusinessCertificateLoading(false)
					Toast.show({
						type: "error",
						text1: "Error",
						text2: "An error occured!"
					})
				}
			}).catch((err) => {
				setBusinessCertificateLoading(false);
			})
		} 
	}
	return (
		<View style={styles.wrapper}>
			{/*Top*/}
			<View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
				<Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
				<View>
					<Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Government ID</Text>
					<Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>Choose document you want to upload</Text>
				</View>
				<View>

				</View>
			</View>

			<View style={{ margin: 15 }}>
				{GovData.map((item, index) => (
					<View key={index}>
						<TouchableOpacity 
							onPress={() => NextScreen(item.screen)} style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", padding: 20, marginBottom: 20, borderRadius: 8, alignItems: "center" }}>
							<View style={{ backgroundColor: "#eee", padding: 10, borderRadius: 100 }}>
								<MaterialCommunityIcons name="flag-checkered" size={24} color={'grey'} />
							</View>

							<View style={{ flex: 1, marginLeft: 15 }}>
								<Text style={{ fontFamily: "lexendBold", color: item.color, fontSize: 16 }}>{item.title}</Text>
								<Text style={{ color: "#7A7B7C", fontFamily: "lexendLight" }}>{item.desc}</Text>
							</View>
							<RenderLeftIcon screen={item.screen} />
						</TouchableOpacity>
					</View>
				))}
			</View>

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
		padding: 25,
		borderRadius: 8
	}
})