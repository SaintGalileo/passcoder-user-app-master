import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather, FontAwesome5 } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { BaseUrl } from '../../utils/Url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColor } from '../../utils/Color';

export default function NextofKinView() {

	const nav = useNavigation();
	const [nextKin, setNextKin] = useState({})
	const [loading, setloading] = useState(true)

	async function GetNext() {
		const userToken = await AsyncStorage.getItem('userToken');
		fetch(`${BaseUrl}/user/nok`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',

			}
		}).then(async (res) => {
			const response = await res.json();
			if (response.data.next_of_kin_data) {
				setNextKin(response.data.next_of_kin_data);
				setloading(false);
			} else {
				setNextKin(response.data)
				setloading(false);
			}
		})
	}

	useEffect(() => {
		GetNext()
	}, [])
	return (
		<View style={styles.wrapper}>
			{/*Top bar*/}
			<View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
				<Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
				<View style={{ alignItems: "center" }}>
					<Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>Next of Kin</Text>
					<Text style={{ fontFamily: "lexendLight", fontSize: 17 }}>Your Next of Kin details</Text>
				</View>
				<View />
			</View>

			{loading ? (
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<ActivityIndicator color={AppColor.Blue} size={'large'} />
				</View>
			) : (
				<View style={{ marginTop: 15, alignSelf: "center", }}>
					<View style={styles.nextOfKin}>
						<View style={{ margin: 15, flexDirection: "row", alignItems: "center" }}>
							<View style={{ backgroundColor: "#eee", borderRadius: 100, height: 50, width: 50, justifyContent: "center", alignItems: "center" }}>
								<FontAwesome5 name="flag-checkered" size={24} color="grey" />
							</View>
							<Text style={{ fontFamily: "lexendMedium", color: "grey", marginLeft: 10 }}>Next of Kin Details</Text>
						</View>

						<View style={{ margin: 15 }}>
							<Text style={{ fontFamily: "lexendBold", color: "grey", fontSize: 16, marginBottom: 10 }}>Name: <Text style={{ fontFamily: "lexendLight" }}>{nextKin?.name}</Text></Text>
							<Text style={{ fontFamily: "lexendBold", color: "grey", fontSize: 16, marginBottom: 10 }}>Email: <Text style={{ fontFamily: "lexendLight" }}>{nextKin?.email}</Text></Text>
							<Text style={{ fontFamily: "lexendBold", color: "grey", fontSize: 16, marginBottom: 10 }}>Phone Number: <Text style={{ fontFamily: "lexendLight" }}>{nextKin?.phone_number === null ? "No Phone Number" : nextKin?.phone_number}</Text></Text>
						</View>
					</View>
				</View>
			)}

			<View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: 20 }}>
				<TouchableOpacity onPress={() => nav.navigate('NextofKinEdit', nextKin)} style={{ backgroundColor: AppColor.Blue, height: 50, borderRadius: 8, justifyContent: "center", alignItems: "center", width: 300 }}>
					<Text style={{ color: "#fff", fontFamily: 'lexendBold' }}>Edit</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1
	},
	nextOfKin: {
		width: 300,
		backgroundColor: "#fff",
		borderRadius: 8,
		height: 'auto',
	}
})