import { ActivityIndicator, FlatList, Image, StyleSheet, Text, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather, FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import { BaseUrl } from '../../../utils/Url';
import { AppColor } from '../../../utils/Color';
import { date_str_alt } from '../../../utils/Validations';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Passport() {

	const nav = useNavigation();
	const [passport, setPassport] = useState({});
	const [passportExt, setPassportExt] = useState('');
	const [loading, setLoading] = useState(false);

	async function GetPassport() {
		setLoading(true);
		const userToken = await AsyncStorage.getItem('userToken');
		fetch(`${BaseUrl}/user/passport`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		}).then(async (res) => {
			const response = await res.json();
			setPassport(response.data);
			
			let lastDotPassport = response.data.proof ? response.data.proof.lastIndexOf('.') : null;
			let extPassport = response.data.proof ? response.data.proof.substring(lastDotPassport + 1) : null;
			setPassportExt(extPassport ? extPassport.toUpperCase() : null);
			setLoading(false);
		}).catch((err) => {
			setLoading(false);
			Toast.show({
				type: 'error',
				text1: "Error",
				text2: "An error occured!"
			})
		})
	}

	useEffect(() => {
		GetPassport()
	}, [])

	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		GetPassport().then(() => { setRefreshing(false) }).catch(() => setRefreshing(false));
	}, []);

	const editScreen = (data) => {
		nav.navigate('EditPassport', {
			passport_number: data.passport_number, issued_date: data.issued_date, expiry_date: data.expiry_date, proof: data.proof, verified: data.verified
		});
	};

	return (
		<View style={styles.wrapper}>

			{/*Top*/}
			<View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
				<Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
				<View>
					<Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>International Passport</Text>
					<Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>Your Government Issued International Passport</Text>
				</View>
				<View>

				</View>
			</View>

			{loading ? (
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<ActivityIndicator color={AppColor.Blue} size={'large'} />
				</View>
			) : (
				<>
					<ScrollView
						refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
						}
					>
						<View style={{ margin: 15 }}>
							<View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
								<View style={{ height: 40, width: 40, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center" }}>
									<FontAwesome5 name="flag-checkered" size={20} color="grey" />
								</View>
								<View style={{ flex: 1, marginLeft: 10 }}>
									<Text style={{ fontFamily: "lexendBold", color: "grey" }}>{passport?.passport_number}</Text>
									<Text style={{ fontFamily: "lexendLight", color: "grey" }}>{date_str_alt(passport?.issued_date).date} - {date_str_alt(passport?.expiry_date).date}</Text>
								</View>
								{
									passport?.verified ?
										<FontAwesome name="check-circle-o" size={24} color="green" /> :
										<MaterialIcons name="info-outline" size={24} color="coral" />
								}
							</View>
						</View>

						{
							passport ?
								<View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
									<Text style={{ fontFamily: "lexendMedium", marginBottom: 10 }}>Scan</Text>
									{
										passportExt !== "PDF" ?
											<Image style={{ height: 300, width: 250 }} resizeMode='contain' source={{ uri: passport?.proof }} /> :
											<Text style={{ fontFamily: "lexendLight", marginBottom: 10 }}>{passport?.proof.split("/")[4]}</Text>
									}
								</View> : ""
						}

					</ScrollView>
					{
						!passport?.verified && !loading ? (
							<View style={{ position: "absolute", bottom: 0, marginBottom: 20, alignSelf: "center", margin: 15 }}>
								<TouchableOpacity style={{ backgroundColor: AppColor.Blue, height: 50, justifyContent: "center", alignItems: "center", width: 300, borderRadius: 8 }} onPress={() => editScreen(passport)}>
									<Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Edit</Text>
								</TouchableOpacity>
							</View>
						) : ""

					}
				</>
			)}

		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
	}
})