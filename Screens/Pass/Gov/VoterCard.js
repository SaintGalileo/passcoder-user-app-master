import { ActivityIndicator, FlatList, Image, StyleSheet, Text, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather, FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import { BaseUrl } from '../../../utils/Url';
import { AppColor } from '../../../utils/Color';
import { date_str_alt } from '../../../utils/Validations';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VoterCard() {

	const nav = useNavigation();
	const [voterCard, setVoterCard] = useState({});
	const [loading, setLoading] = useState(false);

	async function GetVoterCard() {
		setLoading(true);
		const userToken = await AsyncStorage.getItem('userToken');
		fetch(`${BaseUrl}/user/voter/card`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',

			}
		}).then(async (res) => {
			setLoading(false);
			const response = await res.json();
			setVoterCard(response.data);
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
		GetVoterCard()
	}, [])

	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		GetVoterCard().then(() => { setRefreshing(false) }).catch(() => setRefreshing(false));
	}, []);

	const editScreen = (data) => {
		nav.navigate('EditVoterCard', {
			vin: data.vin, card_number: data.card_number, issued_date: data.issued_date, expiry_date: data.expiry_date, proof_front: data.proof_front, proof_back: data.proof_back, verified: data.verified
		});
	};

	return (
		<View style={styles.wrapper}>

			{/*Top*/}
			<View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
				<Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
				<View>
					<Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Voters Card</Text>
					<Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>Your Government Issued Voters Card</Text>
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
									<Text style={{ fontFamily: "lexendBold", color: "grey" }}>VIN: {voterCard?.vin}</Text>
									{
										voterCard?.card_number ? 
											<Text style={{ fontFamily: "lexendMedium", color: "grey" }}>{voterCard?.card_number}</Text> :
											""
									}
									{
										voterCard?.issued_date && voterCard?.expiry_date ? 
											<Text style={{ fontFamily: "lexendLight", color: "grey" }}>{date_str_alt(voterCard?.issued_date).date} - {date_str_alt(voterCard?.expiry_date).date}</Text> : 
											(
												voterCard?.issued_date ? 
													<Text style={{ fontFamily: "lexendLight", color: "grey" }}>Issued: {date_str_alt(voterCard?.issued_date).date}</Text> : 
													(
														voterCard?.expiry_date ? 
															<Text style={{ fontFamily: "lexendLight", color: "grey" }}>Expiring: {date_str_alt(voterCard?.expiry_date).date}</Text> : 
															""
													)
											)
									}
								</View>
								{
									voterCard?.verified ?
										<FontAwesome name="check-circle-o" size={24} color="green" /> :
										<MaterialIcons name="info-outline" size={24} color="coral" />
								}
							</View>
						</View>

						<View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
							<Text style={{ fontFamily: "lexendBold", color: "#000", marginBottom: 10 }}>Front</Text>
							<Image style={{ height: 200, width: 300 }} resizeMode='contain' source={{ uri: voterCard?.proof_front }} />
						</View>

						<View style={{ margin: 15, alignItems: "center", marginBottom: 100 }}>
							<Text style={{ fontFamily: "lexendBold", color: "#000", marginBottom: 10 }}>Back</Text>
							<Image style={{ height: 200, width: 300 }} resizeMode='contain' source={{ uri: voterCard?.proof_back }} />
						</View>

					</ScrollView>
					{
						!voterCard?.verified && !loading ? (
							<View style={{ position: "absolute", bottom: 0, marginBottom: 20, alignSelf: "center", margin: 15 }}>
								<TouchableOpacity style={{ backgroundColor: AppColor.Blue, height: 50, justifyContent: "center", alignItems: "center", width: 300, borderRadius: 8 }} onPress={() => editScreen(voterCard)}>
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