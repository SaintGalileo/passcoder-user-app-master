import { ActivityIndicator, Dimensions, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react';
import { Octicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { AppColor } from '../../utils/Color';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import { timestamp_str_alt, passcoder_icon } from '../../utils/Validations';

export default function Offers() {
	const { width } = Dimensions.get("window");
	const margin = 10;
	const SIZE = (width - (margin * 2 * 2)) / 2;

	const [userPhoto, setUserPhoto] = useState('');

	//nav props
	const nav = useNavigation();

	const [loading, setLoading] = useState(false);
	const [fetchedOffers, setFetchedOffers] = useState([]);
	const [showText, setShowText] = useState(false);

	//render item
	const renderItem = ({ item }) => (
		<TouchableOpacity onPress={() => {
			nav.navigate('Seeoffers', { item: item }) }}>
			<View style={[styles.offers, { width: SIZE, height: 200 }]}>
				<View style={{ margin: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
					<Image resizeMode='contain' style={{ width: 50, height: 50, borderRadius: 100, backgroundColor: "#eee" }} source={{ uri: item?.partner_data?.photo || passcoder_icon }} />
					<View>
						<Text style={{ fontFamily: 'lexendBold', fontSize: 12, flexWrap: 'wrap', width: 95 }}>{item?.partner_data?.name}</Text>
						<Text style={{ fontFamily: 'lexendMedium', fontSize: 10, flexWrap: 'wrap', width: 95}}>{item?.partner_data?.city}</Text>
					</View>
				</View>
				<View style={{ borderWidth: 1, margin: 15, marginTop: -5, borderStyle: "dashed", borderColor: "grey" }} />

				<View style={{ margin: 15, marginTop: -5, flexDirection: "row", justifyContent: "space-between" }}>
					<View>
						<Text style={{ fontFamily: "lexendMedium", fontSize: 13, width: 100, marginBottom: 5 }}>{item?.name}</Text>
					</View>
					<View style={{ width: 1 }} />
					<View style={{ height: 40, width: 40, backgroundColor: "#5270B9", borderBottomLeftRadius: 20, justifyContent: "center", alignItems: "center" }}>
						<Text style={{ fontFamily: "lexendBold", fontSize: 15, color: "#fff" }}>{item?.discount}<Text style={{ fontSize: 13 }}>%</Text></Text>
					</View>
				</View>
				<View style={{ marginLeft: 15, marginRight: 15, marginTop: -5 }}>
					{
						item?.start !== null && item?.end !== null ?
							<>
								<Text style={{ fontFamily: "lexendMedium", fontSize: 10, color: "red" }}>Valid through:</Text>
								<Text style={{ fontFamily: "lexendLight", fontSize: 9, color: "grey" }}>{timestamp_str_alt(item?.start).fulldate}</Text>
								<Text style={{ fontFamily: "lexendLight", fontSize: 9, color: "grey", textAlign: "center" }}>to</Text>
								<Text style={{ fontFamily: "lexendLight", fontSize: 9, color: "grey" }}>{timestamp_str_alt(item?.end).fulldate}</Text>
							</> : (
								item?.start !== null && item?.end === null ? 
									<>
										<Text style={{ fontFamily: "lexendMedium", fontSize: 10, color: "green" }}>Starts</Text>
										<Text style={{ fontFamily: "lexendLight", fontSize: 9, color: "grey" }}>{timestamp_str_alt(item?.start).fulldate}</Text>
									</> : (
										item?.end !== null && item?.start === null ?
											<>
												<Text style={{ fontFamily: "lexendMedium", fontSize: 10, color: "red" }}>Ends</Text>
												<Text style={{ fontFamily: "lexendLight", fontSize: 9, color: "grey" }}>{timestamp_str_alt(item?.end).fulldate}</Text>
											</> : 
											<Text style={{ fontFamily: "lexendMedium", fontSize: 10, color: "green" }}>Ongoing</Text>
									)
							)
					}
				</View>

				{/* Can add later if you want */}
				{/* <TouchableOpacity onPress={() => {
					nav.navigate('Seeoffers', { item: item })
				}} style={{ margin: 15, height: 30, justifyContent: "center", alignItems: "center", borderWidth: 1, borderRadius: 8 }}>
					<Text style={{ fontFamily: 'lexendMedium', fontSize: 12 }}>View offer</Text>
				</TouchableOpacity> */}
			</View>
		</TouchableOpacity>
	);

	async function GetOffer() {
		setLoading(true);
		const userToken = await AsyncStorage.getItem('userToken');
		fetch(`${BaseUrl}/user/profile`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',

			}
		}).then(async (res) => {
			const response = await res.json();
			setUserPhoto(response.data.photo);
		}).catch((err) => {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Error occured - 100"
			})
		})

		fetch(`${BaseUrl}/user/offers/all?size=50`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',

			}
		}).then(async (res) => {
			setLoading(false);
			const response = await res.json();
			if (response.success === true) {
				setFetchedOffers(response.data !== null ? response.data.rows.sort((a, b) => new Date(a.createdAt.date + " " + a.createdAt.time).getTime() < new Date(b.createdAt.date + " " + b.createdAt.time).getTime() ? 1 : -1) : []);
			} else {
				setShowText(true);
			}
		}).catch((err) => {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Error occured - 101"
			})
		})
	}

	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		GetOffer()
	}, []);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		GetOffer().then(() => {
			setRefreshing(false)
		})
	}, []);

	return (
		<View style={styles.wrapper}>
			{/*Top bar*/}
			<View style={styles.topBar}>
				<View>
					<Text style={{ fontFamily: "lexendBold", fontSize: 19 }}>Offers</Text>
					<Text style={{ fontFamily: "lexendMedium", color: "grey", flexWrap: 'wrap', width: 220, marginTop: 5 }}>Get millions of exclusive offers from our partners</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					<MaterialCommunityIcons name="wallet-outline" size={24} color="black" style={{ marginRight: 15 }} onPress={() => {
						nav.navigate("Wallet")
					}} />
					<Octicons name="bell" size={24} color="black" style={{ marginRight: 15 }} onPress={() => nav.navigate('Notifications')} />
					<TouchableOpacity onPress={() => nav.navigate("Profile")}>
						<Image style={{ width: 35, height: 35, borderWidth: 1, borderColor: AppColor.Blue, borderRadius: 100, backgroundColor: "#eee" }} source={{ uri: userPhoto || passcoder_icon }} />
					</TouchableOpacity>
				</View>
			</View>

			{/*Discount card*/}
			<View style={styles.card}>
				<View style={{ margin: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
					<Image resizeMode='contain' style={{ height: 100, width: 100 }} source={require('../../assets/img/white.png')} />
					<View >
						<Text style={{ fontFamily: "lexendBold", color: "#fff", fontSize: 17 }}>Endless Possibilities,</Text>
						<Text style={{ fontFamily: "lexendBold", color: "#fff", fontSize: 17 }}>Amazing Offers</Text>
					</View>
				</View>
			</View>

			{/*OFfers*/}
			<View style={{ margin: 15 }}>
				{/* <Text style={{ fontFamily: "lexendBold", fontSize: 20 }}>Offers</Text> */}
				{loading ? (
					<View style={{ flex: 1, justifyContent: "center", alignItems: "center", top: 200 }}>
						<ActivityIndicator color={AppColor.Blue} size={'large'} />
					</View>
				) : (
					<>
						{(fetchedOffers.length === 0 || showText) && <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
							<Text style={{ fontFamily: "lexendBold", fontSize: 20 }}>Offers not found!</Text>
						</View>}
						<FlatList
							refreshing={refreshing}
							refreshControl={
								<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
							}
							contentContainerStyle={{ paddingBottom: 300 }}
							showsVerticalScrollIndicator={false}
							data={fetchedOffers}
							numColumns={2}
							columnWrapperStyle={{
								flex: 1,
								justifyContent: "space-between"
							}}
							keyExtractor={item => `${item.unique_id}`}
							renderItem={renderItem}
							style={{ marginTop: 10 }}
						/>
					</>
				)}
			</View>

		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
	},
	topBar: {
		margin: 15,
		marginTop: 50,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between"
	},
	card: {
		width: Dimensions.get('screen').width - 30,
		height: 130,
		backgroundColor: "#292482",
		margin: 15,
		borderRadius: 8,
		alignSelf: "center"
	},
	offers: {
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.27,
		shadowRadius: 4.65,
		elevation: 6,
		height: 'auto',
		backgroundColor: "#fff",
		marginBottom: 10,
		borderRadius: 8,
		borderWidth: 1,
		borderStyle: "dashed",
		borderColor: 'grey'
	},
	buttons: {
		backgroundColor: AppColor.Blue,
		height: 40,
		width: 100,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 8
	}
})