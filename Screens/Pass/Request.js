import { ActivityIndicator, Dimensions, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react';
import { Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { AppColor } from '../../utils/Color';
import { useNavigation } from '@react-navigation/native';
import { BaseUrl } from '../../utils/Url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from "react-native-modal";
import Toast from 'react-native-toast-message';
import { passcoder_icon } from "../../utils/Validations";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

export default function Request() {

	const nav = useNavigation();

	const [otherRequestLoading, setOtherRequestLoading] = useState(false);
	const [pendingRequestLoading, setPendingReqeustLoading] = useState(false);

	const ScreenData = [
		{
			title: "Pending"
		},
		{
			title: "History"
		}
	];

	const [fetchedPenRequest, setFetchedPenReq] = useState([]);
	const [fetchedRequest, setFetchedRequest] = useState([])
	const [showNoPenReq, setShowNoPenReq] = useState();

	const [currentScreen, setCurrentScreen] = useState('Pending');

	const [acceptLoading, setAcceptLoading] = useState(false);
	const [declineLoading, setDeclineLoading] = useState(false);

	const [userPhoto, setUserPhoto] = useState('');
	const [noPend, setNoPend] = useState(false);
	const [noHist, setNoHist] = useState(false);

	async function GetPendingRequests() {
		setFetchedPenReq([]);
		setPendingReqeustLoading(true);
		const passToken = await AsyncStorage.getItem('userToken')
		fetch(`${BaseUrl}/user/pending/requests`, {
			method: "POST",
			headers: {
				'passcoder-access-token': passToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		}).then(async (res) => {
			const response = await res.json();
			if (response.data !== null) {
				setFetchedPenReq(response.data !== null ? response.data.rows.sort((a, b) => new Date(a.updatedAt.date + " " + a.updatedAt.time).getTime() < new Date(b.updatedAt.date + " " + b.updatedAt.time).getTime() ? 1 : -1) : []);
				setPendingReqeustLoading(false);
			} else {
				setNoPend(true);
				setPendingReqeustLoading(false);
			}
		})
	}

	async function GetRequests() {
		setFetchedRequest([]);
		setOtherRequestLoading(true);
		const passToken = await AsyncStorage.getItem('userToken')
		fetch(`${BaseUrl}/user/profile`, {
			method: "POST",
			headers: {
				'passcoder-access-token': passToken,
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
		
		fetch(`${BaseUrl}/user/requests?size=50`, {
			method: "POST",
			headers: {
				'passcoder-access-token': passToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		}).then(async (res) => {
			const response = await res.json();
			if (response.data !== null) {
				setFetchedRequest(response.data !== null ? response.data.rows.sort((a, b) => new Date(a.updatedAt.date + " " + a.updatedAt.time).getTime() < new Date(b.updatedAt.date + " " + b.updatedAt.time).getTime() ? 1 : -1) : []);
				setOtherRequestLoading(false);
			} else {
				setNoHist(true);
				setOtherRequestLoading(false);
			}
		}).catch((err) => {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Error occured - 101"
			})
		})
	}

	async function Accept(id) {
		setLoadModal(true);
		setAcceptLoading(true);
		const passToken = await AsyncStorage.getItem('userToken')
		fetch(`${BaseUrl}/user/accept/request`, {
			method: "POST",
			headers: {
				'passcoder-access-token': passToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				unique_id: id
			})
		}).then(async (res) => {
			const response = await res.json();
			if (response.success === true) {
				setLoadModal(false);
				GetPendingRequests();
				Toast.show({
					type: "success",
					text1: "Success",
					text2: "Request Accepted"
				})
			} else {
				setLoadModal(false);
				setAcceptLoading(false);
				Toast.show({
					type: "error",
					text1: "Error",
					text2: res.status !== 422 ? response.message : response.data[0].msg
				})
			}
		}).catch((err) => {
			setLoadModal(false);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "An error occured!!"
			});
		})
	}

	async function Decline(id) {
		setLoadModal(true);
		setDeclineLoading(false);
		const passToken = await AsyncStorage.getItem('userToken')
		fetch(`${BaseUrl}/user/decline/request`, {
			method: "POST",
			headers: {
				'passcoder-access-token': passToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				unique_id: id
			})
		}).then(async (res) => {
			const response = await res.json();
			if (response.success === true) {
				setLoadModal(false);
				GetPendingRequests();
				Toast.show({
					type: "success",
					text1: "Success",
					text2: "Request Declined!"
				})
			} else {
				setLoadModal(false);
				setDeclineLoading(false);
				Toast.show({
					type: "error",
					text1: "Error",
					text2: res.status !== 422 ? response.message : response.data[0].msg
				})
			}
		}).catch((err) => {
			setLoadModal(false);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "An error occured!!"
			});
		})
	}

	const [activeID, setActiveID] = useState('');

	useEffect(() => {
		GetPendingRequests()
		GetRequests()
	}, [])

	const [loadModal, setLoadModal] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [refreshing2, setRefreshing2] = useState(false);

	//render other status bar
	const RenderStatus = ({ status }) => {
		if (status === "Completed") {
			return (
				<View style={{ height: 70, width: 5, backgroundColor: "green", borderRadius: 8, marginLeft: 5 }} />
			)
		} else if (status === "Authenticated") {
			return (
				<View style={{ height: 70, width: 5, backgroundColor: "green", borderRadius: 8, marginLeft: 5 }} />
			)
		} else if (status === "Ineligible") {
			return (
				<View style={{ height: 70, width: 5, backgroundColor: "red", borderRadius: 8, marginLeft: 5 }} />
			)
		} else if (status === "Timeout") {
			return (
				<View style={{ height: 70, width: 5, backgroundColor: "coral", borderRadius: 8, marginLeft: 5 }} />
			)
		} else if (status === "Unauthenticated") {
			return (
				<View style={{ height: 70, width: 5, backgroundColor: "red", borderRadius: 8, marginLeft: 5 }} />
			)
		}
	}

	const RenderStatusAlt = (status) => {
		if (status === "Completed") {
			return "green";
		} else if (status === "Authenticated") {
			return "green";
		} else if (status === "Ineligible") {
			return "red";
		} else if (status === "Timeout") {
			return "coral";
		} else if (status === "Unauthenticated") {
			return "red";
		}
	}

	const RenderSeen = () => {
		const [fetched, setFetced] = useState({});

		async function GetReq() {
			const userToken = await AsyncStorage.getItem('userToken')
			fetch(`${BaseUrl}/user/request`, {
				method: "POST",
				headers: {
					'passcoder-access-token': userToken,
					'Accept': 'application/json',
					'Content-Type': 'application/json',

				},
				body: JSON.stringify({
					unique_id: activeID
				})
			}).then(async (res) => {
				const response = await res.json();
				setFetced(response.data);
			}).catch((err) => {
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "An error occured!"
				});
			})
		}

		useEffect(() => {
			GetReq()
		}, [])
		return (
			<Modal style={{ margin: 0 }} isVisible={showModal} onBackButtonPress={() => setShowModal(false)} onBackdropPress={() => setShowModal(false)}>
				{
					fetched?.platform_data !== null ? (
						<View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

							<View style={{}}>
								<View style={{ height: 70, width: 70, borderTopLeftRadius: 50, borderTopRightRadius: 50, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, backgroundColor: `${RenderStatusAlt(fetched?.status)}`, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
									<Ionicons name="md-finger-print" size={30} color="#eee" />
								</View>
								<View style={{ alignItems: "center", marginTop: 15 }}>
									<Text style={{ fontFamily: 'lexendBold', fontSize: 16, marginBottom: 5 }}>{fetched?.platform_data?.name}</Text>
									<Text style={{ fontFamily: "lexendMedium", fontSize: 14, marginBottom: 5, margin: 5, textAlign: "center" }}>{fetched?.model ? fetched?.model + " - " : ""}{fetched?.type}</Text>
									<Text style={{ fontFamily: "lexendMedium", fontSize: 14, color: "grey", marginBottom: 10, margin: 5, textAlign: "center" }}>{fetched?.details || "No details"}</Text>
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
										<View style={{ height: 70, width: 70, borderTopLeftRadius: 50, borderTopRightRadius: 50, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, backgroundColor: `${RenderStatusAlt(fetched?.status)}`, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
										<Ionicons name="md-finger-print" size={30} color="#eee" />
									</View>
									<View style={{ alignItems: "center", marginTop: 15 }}>
										<Text style={{ fontFamily: 'lexendBold', fontSize: 16, marginBottom: 10 }}>{fetched?.partner_data?.name + ", " + fetched?.partner_data?.city}</Text>
										{
											fetched?.type === "Payment" ? 
												<Text style={{ fontFamily: "lexendMedium", fontSize: 14, marginLeft: 5, marginRight: 5, textAlign: "center" }}>{fetched?.type}</Text> : 
												null
										}
										<Text style={{ fontFamily: "lexendMedium", fontSize: 14, marginBottom: 10, margin: 10, textAlign: "center" }}>{fetched?.offer_data ? fetched?.offer_data?.name.trim() + " offer authorization" : fetched?.details}</Text>
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
							fetched?.request_user_data !== null ? (
								<View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

									<View style={{}}>
										<View style={{ height: 70, width: 70, borderTopLeftRadius: 50, borderTopRightRadius: 50, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, backgroundColor: `${RenderStatusAlt(fetched?.status)}`, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
											<Ionicons name="md-finger-print" size={30} color="#eee" />
										</View>
										<View style={{ alignItems: "center", marginTop: 15 }}>
											<Text style={{ fontFamily: 'lexendBold', fontSize: 16, marginBottom: 10 }}>{fetched?.request_user_data?.firstname + (fetched?.request_user_data?.middlename ? " " + fetched?.request_user_data?.middlename + " " : " ") + fetched?.request_user_data?.lastname}</Text>
											{
												fetched?.type === "Payment" ?
													<Text style={{ fontFamily: "lexendMedium", fontSize: 14, marginLeft: 5, marginRight: 5, textAlign: "center" }}>{fetched?.type}</Text> :
													<Text style={{ fontFamily: "lexendMedium", fontSize: 14, margin: 5, textAlign: "center" }}>{"Authorization request"}</Text>
											}
											<Text style={{ fontFamily: "lexendMedium", fontSize: 14, color: "grey", marginBottom: 10, margin: 5, textAlign: "center" }}>{fetched?.details || "No details"}</Text>
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
											<Ionicons name="md-finger-print" size={30} color="black" />
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
					)
				}
			</Modal>
		)
	}

	//render item
	const renderItem = ({ item }) => {
		return (
			<TouchableOpacity onPress={() => {
				setActiveID(item?.unique_id);
				setShowModal(true)
			}} style={{ marginBottom: 25, backgroundColor: "#fff", padding: 15, borderRadius: 8, }}>
				{
					item?.platform_data !== null ? (
						<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
							<View>
								<Image source={{ uri: item?.platform_data?.photo || passcoder_icon }} style={{ height: 50, width: 50, borderRadius: 8 }} />
							</View>
							<View style={{ marginLeft: 10, flex: 1 }}>
								<Text style={{ fontFamily: "lexendBold" }}>{item?.platform_data?.name}</Text>
								<Text style={{ fontFamily: "lexendBold", color: "grey" }}>{item?.type}</Text>
								<Text style={{ fontFamily: "lexendLight", color: "grey", fontSize: 13 }}>{item?.updatedAt?.fulldate}</Text>
							</View>
							<View>
								<RenderStatus status={item?.status} />
							</View>
						</View>
					) : (
						item?.partner_data !== null ? (
							<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
								<View>
									<Image source={{ uri: item?.partner_data?.photo || passcoder_icon }} style={{ height: 50, width: 50, borderRadius: 8 }} />
								</View>
								<View style={{ marginLeft: 10, flex: 1 }}>
									<Text style={{ fontFamily: "lexendBold" }}>{item?.partner_data?.name + ", " + item?.partner_data?.city}</Text>
									<Text style={{ fontFamily: "lexendBold", color: "grey", fontSize: 13 }}>{item?.offer_data ? item?.offer_data?.name.trim() + " offer authorization" : item?.details}</Text>
									<Text style={{ fontFamily: "lexendLight", color: "grey", fontSize: 13 }}>{item?.updatedAt?.fulldate}</Text>
								</View>
								<View>
									<RenderStatus status={item?.status} />
								</View>
							</View>
						) : (
							item?.request_user_data !== null ? (
								<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
									<View>
										<Image source={{ uri: item?.request_user_data?.photo || passcoder_icon }} style={{ height: 50, width: 50, borderRadius: 8 }} />
									</View>
									<View style={{ marginLeft: 10, flex: 1 }}>
										<Text style={{ fontFamily: "lexendBold" }}>{item?.request_user_data?.firstname + (item?.request_user_data?.middlename ? " " + item?.request_user_data?.middlename + " " : " ") + item?.request_user_data?.lastname}</Text>
										<Text style={{ fontFamily: "lexendBold", color: "grey" }}>{"Authorization request"}</Text>
										<Text style={{ fontFamily: "lexendLight", color: "grey", fontSize: 13 }}>{item?.updatedAt?.fulldate}</Text>
									</View>
									<View>
										<RenderStatus status={item?.status} />
									</View>
								</View>
							) : (
								<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
									<View style={{ marginLeft: 5, marginRight: 5, flex: 1 }}>
										<Text style={{ fontFamily: "lexendMedium", fontSize: 16, color: "red" }}>Request not found</Text>
									</View>
								</View>
							)
						)
					)
				}
			</TouchableOpacity>
		)
	}

	//render item
	const renderItem2 = ({item}) => (
		<TouchableOpacity style={{ marginBottom: 25, backgroundColor: "#fff", padding: 15, borderRadius: 8, height: 'auto' }}>
			{
				item?.platform_data !== null ? (
					<TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
						<View>
							<Image source={{ uri: item?.platform_data?.photo || passcoder_icon }} style={{ height: 50, width: 50, borderRadius: 8 }} />
						</View>
						<View style={{ marginLeft: 10, flex: 1 }}>
							<Text style={{ fontFamily: "lexendBold" }}>{item?.platform_data?.name}</Text>
							<Text style={{ fontFamily: "lexendBold", color: "grey" }}>{item?.type}</Text>
							<Text style={{ fontFamily: "lexendBold", color: "grey", fontSize: 10, marginBottom: 5 }}>{item?.details || "No details"}</Text>
							<Text style={{ fontFamily: "lexendLight", color: "grey", fontSize: 13 }}>{item?.updatedAt?.fulldate}</Text>
						</View>
						<View>
							<RenderStatus status={item?.status} />
						</View>
					</TouchableOpacity>
				) : (
					item?.partner_data !== null ? (
						<TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
							<View>
								<Image source={{ uri: item?.partner_data?.photo || passcoder_icon }} style={{ height: 50, width: 50, borderRadius: 8 }} />
							</View>
							<View style={{ marginLeft: 10, flex: 1 }}>
								<Text style={{ fontFamily: "lexendBold" }}>{item?.partner_data?.name + ", " + item?.partner_data?.city}</Text>
								<Text style={{ fontFamily: "lexendBold", color: "grey" }}>{item?.offer_data?.name.trim() + " offer authorization"}</Text>
								{
									item?.details ? 
										<Text style={{ fontFamily: "lexendBold", color: "grey", fontSize: 10, marginBottom: 5 }}>{item?.details}</Text> : 
										""
								}
								<Text style={{ fontFamily: "lexendLight", color: "grey", fontSize: 13 }}>{item?.updatedAt?.fulldate}</Text>
							</View>
							<View>
								<RenderStatus status={item?.status} />
							</View>
						</TouchableOpacity>
					) : (
						item?.request_user_data !== null ? (
							<TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
								<View>
									<Image source={{ uri: item?.request_user_data?.photo || passcoder_icon }} style={{ height: 50, width: 50, borderRadius: 8 }} />
								</View>
								<View style={{ marginLeft: 10, flex: 1 }}>
									<Text style={{ fontFamily: "lexendBold" }}>{item?.request_user_data?.firstname + (item?.request_user_data?.middlename ? " " + item?.request_user_data?.middlename + " " : " ") + item?.request_user_data?.lastname}</Text>
									<Text style={{ fontFamily: "lexendBold", color: "grey" }}>{"Authorization request"}</Text>
									<Text style={{ fontFamily: "lexendBold", color: "grey", fontSize: 10, marginBottom: 5 }}>{item?.details || "No details"}</Text>
									<Text style={{ fontFamily: "lexendLight", color: "grey", fontSize: 13 }}>{item?.updatedAt?.fulldate}</Text>
								</View>
								<View>
									<RenderStatus status={item?.status} />
								</View>
							</TouchableOpacity>
						) : (
							<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
								<View style={{ marginLeft: 5, marginRight: 5, flex: 1 }}>
									<Text style={{ fontFamily: "lexendMedium", fontSize: 16, color: "red" }}>Request not found</Text>
								</View>
							</View>
						)
					)
				)
			}

			<View style={{ flexDirection: 'row', justifyContent: "space-between", marginTop: 15 }}>
				<TouchableOpacity onPress={() => Accept(item?.unique_id)} style={{ backgroundColor: AppColor.Blue, padding: 12, flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 8 }}>
					<Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Accept</Text>
				</TouchableOpacity>
				<View style={{ width: 20 }} />
				<TouchableOpacity onPress={() => Decline(item?.unique_id)} style={{ backgroundColor: null, padding: 12, flex: 1, borderWidth: 1.5, borderColor: AppColor.Blue, borderRadius: 8, justifyContent: "center", alignItems: "center" }}>
					<Text style={{ color: AppColor.Blue, fontFamily: "lexendBold" }}>Decline</Text>
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	)

	const RenderLoadModal = () => {
		return (
			<Modal isVisible={loadModal} >
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<ActivityIndicator color={AppColor.Blue} size={'large'} />
				</View>
			</Modal>
		)

	}

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		GetRequests().then(() => { setRefreshing(false) }).catch(() => setRefreshing(false));
	}, []);

	const onRefresh2 = React.useCallback(() => {
		setRefreshing2(true);
		GetPendingRequests().then(() => setRefreshing2(false)).catch(() => setRefreshing2(false));
	}, []);

	function HistoryScreen() {
		return (
			otherRequestLoading ? (
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<ActivityIndicator color={AppColor.Blue} size={'large'} />
				</View>
			) : (
				<>
					<View style={{ marginTop: 20, margin: 15 }}>
						{noHist && <View style={{ justifyContent: "center", alignItems: "center", marginTop: 30 }}>
							<Text style={{ fontFamily: "lexendBold" }}>No history!</Text>
						</View>}
						<FlatList
							refreshing={refreshing}
							refreshControl={
								<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
							}
							contentContainerStyle={{ paddingBottom: 300 }}
							showsVerticalScrollIndicator={false}
							data={fetchedRequest}
							keyExtractor={item => `${item.unique_id}`}
							renderItem={renderItem}
						/>
					</View>
				</>
			)
		)
	};

	function PendingScreen() {
		return (
			pendingRequestLoading ? (
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<ActivityIndicator color={AppColor.Blue} size={'large'} />
				</View>
			) : (
				<View style={{ marginTop: 20, margin: 15 }}>
					{fetchedPenRequest.length === 0 && <View style={{ justifyContent: "center", alignItems: "center", marginTop: 30 }}>
						<Text style={{ fontFamily: "lexendBold" }}>No Pending Request!</Text>
					</View>}
					<FlatList
						refreshing={refreshing2}
						refreshControl={
							<RefreshControl refreshing={refreshing2} onRefresh={onRefresh2} />
						}
						contentContainerStyle={{ paddingBottom: 200 }}
						showsVerticalScrollIndicator={false}
						data={fetchedPenRequest}
						keyExtractor={item => `${item.unique_id}`}
						renderItem={renderItem2}
					/>
				</View>
			)
		)
	};

	return (
		<>
			<RenderSeen />
			<RenderLoadModal />
			<View style={styles.wrapper}>

				<View style={styles.topBar}>
					<View>
						<Text style={{ fontFamily: "lexendBold", fontSize: 20 }}>Requests</Text>
						<Text style={{ fontFamily: "lexendMedium", color: "grey", flexWrap: 'wrap', width: 220, marginTop: 5 }}>Your passcoder authorization requests</Text>
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

				<Tab.Navigator screenOptions={{
					tabBarInactiveTintColor: 'grey',
					tabBarStyle: { backgroundColor: "smokewhite" },
					tabBarLabelStyle: { fontFamily: "lexendBold", color: AppColor.Blue, textTransform: 'none' },
					tabBarIndicatorStyle: { backgroundColor: AppColor.Blue }
				}}>
					<Tab.Screen name="Pending" component={PendingScreen} />
					<Tab.Screen name="History" component={HistoryScreen} />
				</Tab.Navigator>

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
	acceptBTN: {
		borderWidth: 1.5,
		borderColor: AppColor.Blue,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 8,
		height: 45,
		width: 130
	},
	declineBTN: {
		backgroundColor: AppColor.Blue,
		height: 45,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		width: 130
	},
	historyStyle: {
		height: 'auto',
		backgroundColor: "#fff",
		borderRadius: 8,
		marginBottom: 20,
		marginTop: 10
	},
	topText: {
		fontFamily: "lexendBold",
		fontSize: 15
	},
	partner: {
		fontFamily: "lexendMedium",
		color: "grey"
	},
	timeStyle: {
		fontFamily: 'lexendMedium',
		fontSize: 12,
		color: "grey"
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