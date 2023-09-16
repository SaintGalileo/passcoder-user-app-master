import { ActivityIndicator, FlatList, Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons, Entypo, Feather, Octicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppColor } from '../../utils/Color';
import { BaseUrl } from '../../utils/Url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from "react-native-modal";
import { passcoder_icon } from "../../utils/Validations";

export default function Browseapp() {

	const [loading, setLoading] = useState(true);
	const [errMessage, setErrMessage] = useState('');
	const [showModal, setShowModal] = useState(false);

	const [fetched, setFetched] = useState({});

	//render item
	const renderItem = ({ item }) => (
		<TouchableOpacity onPress={() => {
			setFetched(item);
			setShowModal(true)
		}} style={{ marginBottom: 15 }}>
			<View style={{ flexDirection: "row", height: "auto", backgroundColor: '#fff', padding: 20, borderRadius: 8 }}>
				<Image source={{ uri: item?.partner_data?.photo || item?.platform_data?.photo }} style={{ height: 50, width: 50, borderRadius: 100, backgroundColor: "#eee" }} />
				<View style={{ marginLeft: 10 }}>
					<Text style={{ fontFamily: "lexendBold" }}>{item?.partner_data !== null ? item?.partner_data?.name + ", " + item?.partner_data?.city : item?.partner_data?.name || item?.platform_data?.name}</Text>
					<Text style={{ fontFamily: "lexendBold" }}>{item?.partner_data === null ? "Business" : "Partner"}</Text>
					<Text style={{ fontFamily: "lexendLight", color: "grey" }}>{item?.updatedAt?.fulldate}</Text>
				</View>
			</View>
		</TouchableOpacity>
	)

	const [apps, setApps] = useState([]);

	const [userPhoto, setUserPhoto] = useState('');
	const [refreshing, setRefreshing] = useState(false);

	async function GetCurrentUserApps() {
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
				text2: "Error occured - 100"
			})
		})

		fetch(`${BaseUrl}/user/apps?size=50`, {
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
				setApps(response.data !== null ? response.data.rows.sort((a, b) => new Date(a.updatedAt.date + " " + a.updatedAt.time).getTime() < new Date(b.updatedAt.date + " " + b.updatedAt.time).getTime() ? 1 : -1) : []);
			} else {
				setErrMessage(response.message);
			}
		}).catch((err) => {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Error occured - 101"
			})
		})
	}

	useEffect(() => {
		GetCurrentUserApps()
	}, [])

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		GetCurrentUserApps().then(() => {
			setRefreshing(false)
		})
	}, []);

	//nav props
	const nav = useNavigation();

	const RenderEachApp = () => {
		
		return (
			<Modal style={{ margin: 0 }} isVisible={showModal} onBackButtonPress={() => setShowModal(false)} onBackdropPress={() => setShowModal(false)}>
				{
					fetched?.platform_data !== null ? (
						<View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

							<View style={{}}>
								<View style={{ height: 70, width: 70, borderTopLeftRadius: 50, borderTopRightRadius: 50, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
									<Image source={{ uri: fetched?.platform_data?.photo }} style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee" }} />
									{
										fetched?.platform_data?.verified ?
											<MaterialIcons name="verified" size={24} color="green" style={{ position: 'absolute', top: -10, right: -15 }} /> :
											""
									}
								</View>
								<View style={{ alignItems: "center", marginTop: 15 }}>
									<Text style={{ fontFamily: 'lexendBold', fontSize: 16, marginBottom: 5 }}>{fetched?.platform_data?.name}</Text>
									{
										fetched?.platform_data?.hospitality ? 
											<Text style={{ fontFamily: "lexendMedium", fontSize: 14, color: "grey", marginBottom: 10, margin: 5, textAlign: "center" }}>Hospitality Platform</Text> : 
											""
									}
									<Text style={{ fontFamily: 'lexendLight', fontSize: 12, color: "grey", marginBottom: 10 }}>{fetched?.updatedAt?.fulldate}</Text>
								</View>
								<View>
									<TouchableOpacity onPress={() => setShowModal(false)} style={{ backgroundColor: AppColor.Blue, height: 45, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 15 }}>
										<Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					) : (
						fetched?.partner_data !== null ? (
							<View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

								<View style={{}}>
									<View style={{ height: 70, width: 70, borderTopLeftRadius: 50, borderTopRightRadius: 50, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
										<Image source={{ uri: fetched?.partner_data?.photo}} style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee" }} />
										{
											fetched?.partner_data?.verified ? 
												<MaterialIcons name="verified" size={24} color="green" style={{ position: 'absolute', top: -10, right: -15 }} /> : 
												""
										}
									</View>
									<View style={{ alignItems: "center", marginTop: 15 }}>
										<Text style={{ fontFamily: 'lexendBold', fontSize: 16, marginBottom: 5 }}>{fetched?.partner_data?.name + ", " + fetched?.partner_data?.city}</Text>
										<Text style={{ fontFamily: 'lexendBold', fontSize: 15, marginBottom: 5 }}>{fetched?.partner_data?.state + ", " + fetched?.partner_data?.country}</Text>
										<Text style={{ fontFamily: "lexendMedium", fontSize: 16, color: "grey", marginBottom: 5, margin: 5, textAlign: "center" }}>{fetched?.points} pts</Text>
										<Text style={{ fontFamily: 'lexendLight', fontSize: 12, color: "grey", marginBottom: 10 }}>{fetched?.updatedAt?.fulldate}</Text>
									</View>
									<View>
										<TouchableOpacity onPress={() => setShowModal(false)} style={{ backgroundColor: AppColor.Blue, height: 45, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 15 }}>
											<Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
										</TouchableOpacity>
									</View>
								</View>

							</View>
						) : (
							<View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

								<View style={{}}>
									<View style={{ height: 70, width: 70, borderTopLeftRadius: 50, borderTopRightRadius: 50, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
										<Ionicons name="md-alert-circle-outline" size={30} color="black" />
									</View>
									<View style={{ alignItems: "center", marginTop: 15 }}>
										<Text style={{ fontFamily: 'lexendBold', fontSize: 15, color: "red", marginBottom: 10 }}>Request not found</Text>
									</View>
									<View>
										<TouchableOpacity onPress={() => setShowModal(false)} style={{ backgroundColor: AppColor.Blue, height: 45, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 15 }}>
											<Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
										</TouchableOpacity>
									</View>
								</View>

							</View>
						)
					)
				}
			</Modal>
		)
	}

	return (
		<>
			<RenderEachApp />
			<View style={styles.wrapper}>

				{/*Top bar*/}
				<View style={styles.topBar}>
					<View>
						<Text style={{ fontFamily: "lexendBold", fontSize: 19 }}>Browse Apps</Text>
						<Text style={{ fontFamily: "lexendMedium", color: "grey", flexWrap: 'wrap', width: 220, marginTop: 5 }}>Browse your apps verified with Passcoder</Text>
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
						<ActivityIndicator color={AppColor.Blue} size={'large'} />
					</View>
				) : (
					<>
						<View style={{ margin: 15 }}>
							{apps.length === 0 && <View style={{ justifyContent: "center", alignItems: "center", marginTop: 30 }}>
								<Text style={{ fontFamily: "lexendBold" }}>No connected apps!</Text>
							</View>}
							<FlatList
								refreshing={refreshing}
								refreshControl={
									<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
								}
								showsVerticalScrollIndicator={false}
								data={apps}
								keyExtractor={item => `${item.unique_id}`}
								renderItem={renderItem}
							/>
						</View>
					</>
				)}

			</View>
		</>
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
	title: {
		fontFamily: "lexendBold",
	},
	patner: {
		fontFamily: "lexendMedium",
		color: "grey"
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