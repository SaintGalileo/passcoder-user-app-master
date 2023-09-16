import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { Entypo, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CredData } from '../../../Data/Credentials';
import { AppColor } from '../../../utils/Color';
import { BaseUrl } from '../../../utils/Url';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Credentials() {

	const nav = useNavigation();

	const [primaryLoading, setPrimaryLoading] = useState(false);
	const [secondaryLoading, setSecondaryLoading] = useState(false);
	const [tertiaryLoading, setTertiaryLoading] = useState(false);
	const [additionalLoading, setAdditionalLoading] = useState(false);
	const [workLoading, setWorkLoading] = useState(false);

	function RenderLeftIcon({ screen }) {
		if (screen === "Primary") {
			return (
				<View>
					{primaryLoading ? (
						<ActivityIndicator color={AppColor.Blue} size={'small'} />
					) : (
						<Entypo name="chevron-right" size={24} color="#7A7B7C" />
					)}
				</View>
			)
		} else if (screen === "Secondary") {
			return (
				<View>
					{secondaryLoading ? (
						<ActivityIndicator color={AppColor.Blue} size={'small'} />
					) : (
						<Entypo name="chevron-right" size={24} color="#7A7B7C" />
					)}
				</View>
			)
		} else if (screen === "Tertiary") {
			return (
				<View>
					{tertiaryLoading ? (
						<ActivityIndicator color={AppColor.Blue} size={'small'} />
					) : (
						<Entypo name="chevron-right" size={24} color="#7A7B7C" />
					)}
				</View>
			)
		} else if (screen === "Additional") {
			return (
				<View>
					{additionalLoading ? (
						<ActivityIndicator color={AppColor.Blue} size={'small'} />
					) : (
						<Entypo name="chevron-right" size={24} color="#7A7B7C" />
					)}
				</View>
			)
		} else if (screen === "Work") {
			return (
				<View>
					{workLoading ? (
						<ActivityIndicator color={AppColor.Blue} size={'small'} />
					) : (
						<Entypo name="chevron-right" size={24} color="#7A7B7C" />
					)}
				</View>
			)
		}
	};

	async function NextScreen(screen) {
		if (screen === 'Primary') {
			const userToken = await AsyncStorage.getItem('userToken')
			setPrimaryLoading(true);
			fetch(`${BaseUrl}/user/primary/school`, {
				method: "POST",
				headers: {
					'passcoder-access-token': userToken,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				}
			}).then(async (res) => {
				const response = await res.json();
				if (res.status === 400) {
					setPrimaryLoading(false);
					nav.navigate("Primary");
				} else if (response.success === true) {
					setPrimaryLoading(false)
					nav.navigate('PrimaryView')
				} else {
					setPrimaryLoading(false)
					Toast.show({
						type: "error",
						text1: "Error",
						text2: "An error occured!"
					})
				}
			}).catch((err) => {
				setPrimaryLoading(false)
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "Fatal error occured!"
				})
			})

		} else if (screen === "Secondary") {

			setSecondaryLoading(true);
			const userToken = await AsyncStorage.getItem('userToken');
			fetch(`${BaseUrl}/user/secondary/schools`, {
				method: "POST",
				headers: {
					'passcoder-access-token': userToken,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				}
			}).then(async (res) => {
				const response = await res.json();
				if (response.message === "Secondary Schools not found!") {
					nav.navigate("Secondary");
					setSecondaryLoading(false);
				} else if (response.success === true) {
					nav.navigate('SecondaryView')
					setSecondaryLoading(false)
				} else {
					setSecondaryLoading(false)
					Toast.show({
						type: "error",
						text1: "Error",
						text2: "An error occured!"
					})
				}
			}).catch((err) => {
				setSecondaryLoading(false)
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "Fatal error occured!"
				})
			})

		} else if (screen === "Tertiary") {

			setTertiaryLoading(true)
			const userToken = await AsyncStorage.getItem('userToken');
			fetch(`${BaseUrl}/user/tertiary/institutions`, {
				method: "POST",
				headers: {
					'passcoder-access-token': userToken,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				}
			}).then(async (res) => {
				const response = await res.json();
				if (response.message === "Tertiary Institutions not found!") {
					nav.navigate("TertiaryAdd");
					setTertiaryLoading(false);
				} else if (response.success === true) {
					nav.navigate('TertiaryView')
					setTertiaryLoading(false)
				} else {
					setTertiaryLoading(false)
					Toast.show({
						type: "error",
						text1: "Error",
						text2: "An error occured!"
					})
				}
			}).catch((err) => {
				setTertiaryLoading(false)
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "Fatal error occured!"
				})
			})

		} else if (screen === "Additional") {

			setAdditionalLoading(true)
			const userToken = await AsyncStorage.getItem('userToken');
			fetch(`${BaseUrl}/user/additional/qualifications`, {
				method: "POST",
				headers: {
					'passcoder-access-token': userToken,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				}
			}).then(async (res) => {
				const response = await res.json();
				if (response.message === "Additional Qualifications not found!") {
					nav.navigate("AdditionalAdd");
					setAdditionalLoading(false);
				} else if (response.success === true) {
					nav.navigate('AdditionalView')
					setAdditionalLoading(false)
				} else {
					setAdditionalLoading(false)
					Toast.show({
						type: "error",
						text1: "Error",
						text2: "An error occured!"
					})
				}
			}).catch((err) => {
				setAdditionalLoading(false)
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "Fatal error occured!"
				})
			})

		} else if (screen === "Work") {
			setWorkLoading(true)
			const userToken = await AsyncStorage.getItem('userToken');
			fetch(`${BaseUrl}/user/work/histories`, {
				method: "POST",
				headers: {
					'passcoder-access-token': userToken,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				}
			}).then(async (res) => {
				const response = await res.json();
				if (response.message === "Work Histories not found!") {
					nav.navigate("WorkAdd");
					setWorkLoading(false);
				} else if (response.success === true) {
					nav.navigate('WorkView')
					setWorkLoading(false)
				} else {
					setWorkLoading(false)
					Toast.show({
						type: "error",
						text1: "Error",
						text2: "An error occured!"
					})
				}
			}).catch((err) => {
				setWorkLoading(false)
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "Fatal error occured!"
				})
			})

		}
	}
	return (
		<View style={styles.wrapper}>
			{/*Top*/}
			<View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
				<Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
				<View>
					<Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Credentials</Text>
					<Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>Choose document you want to upload</Text>
				</View>
				<View>

				</View>
			</View>

			<View style={{ margin: 15 }}>
				{CredData.map((item, index) => (
					<View key={index}>
						<TouchableOpacity onPress={() => NextScreen(item.screen)} style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", padding: 20, marginBottom: 20, borderRadius: 8, alignItems: "center" }}>
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