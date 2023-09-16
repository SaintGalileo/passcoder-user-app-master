import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Entypo, Feather, Octicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { AppColor } from '../../utils/Color';
import { BaseUrl } from '../../utils/Url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { passcoder_icon } from "../../utils/Validations";

export default function Updates() {

	const [userPhoto, setUserPhoto] = useState('')

	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [showText, setShowText] = useState(false);

	//update refresh
	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		GetAnnouncement().then(() => setRefreshing(false)).catch(() => setRefreshing(false))
	}, []);

	const [fetchedAn, setFetchedAn] = useState([]);
	
	//get all announcment
	async function GetAnnouncement() {
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
			setUserPhoto(response.data.photo)
		}).catch((err) => {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Error occured - 101"
			})
		})
		
		fetch(`${BaseUrl}/user/announcements/all?size=50`, {
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
				setFetchedAn(response.data !== null ? response.data.rows.sort((a, b) => new Date(a.createdAt.date + " " + a.createdAt.time).getTime() < new Date(b.createdAt.date + " " + b.createdAt.time).getTime() ? 1 : -1) : []);
			} else {
				setShowText(true)
			}
		}).catch((err) => {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Error occured - 101"
			})
		})
	}

	//use effect to get announcement
	useEffect(() => {
		GetAnnouncement()
	}, [])

	const RenderUpdate = ({ item }) => {
		return (
			<TouchableOpacity
				onPress={() => nav.navigate('Updatesdetail', { partnerID: item?.partner_data?.partner_unique_id, UID: item?.unique_id })}
				style={{ backgroundColor: "#fff", padding: 10, marginBottom: 10, borderRadius: 8, margin: 15 }}>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Image source={{ uri: item?.partner_data?.photo || passcoder_icon }} style={{ height: 55, width: 55, borderRadius: 8, backgroundColor: "#eee" }} />
					<View style={{ flex: 1, marginLeft: 10 }}>
						<Text style={styles.partner}>{item?.title}</Text>
						<Text style={styles.title}>{item?.partner_data?.name + ", " + item?.partner_data?.city}</Text>
						<Text style={styles.time}>{item?.createdAt?.fulldate}</Text>
					</View>
					<Entypo name="chevron-right" size={24} color="#7A7B7C" />
				</View>
			</TouchableOpacity>
		)
	}

	//nav props
	const nav = useNavigation();
	return (
		<View style={styles.wrapper}>

			{/*Top bar*/}
			<View style={styles.topBar}>
				<View>
					<Text style={{ fontFamily: "lexendBold", fontSize: 19 }}>Updates</Text>
					<Text style={{ fontFamily: "lexendMedium", color: "grey", flexWrap: 'wrap', width: 220, marginTop: 5 }}>Stay up-to-date with updates from our partners.</Text>
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

			{loading ? (
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<ActivityIndicator size={'large'} color={AppColor.Blue} />
				</View>
			) : (
				<>
					{(fetchedAn.length === 0 || showText) && <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
						<Text style={{ fontFamily: "lexendBold", fontSize: 15 }}>Announcements not found!</Text>
					</View>}
					<FlatList
						refreshing={refreshing}
						refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
						}
						contentContainerStyle={{ paddingBottom: 50 }}
						showsVerticalScrollIndicator={false}
						data={fetchedAn}
						renderItem={({ item }) => <RenderUpdate item={item} />}
						keyExtractor={item => item.unique_id}
					/>
				</>

			)}

		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		// margin: 15
	},
	topBar: {
		margin: 15,
		marginTop: 50,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between"
	},
	title: {
		fontFamily: "lexendMedium",
		color: "grey",
		fontSize: 12
	},
	partner: {
		fontFamily: "lexendBold",
		color: "#000", 
		fontSize: 15
	},
	time: {
		fontFamily: "lexendMedium",
		color: "grey",
		fontSize: 11
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