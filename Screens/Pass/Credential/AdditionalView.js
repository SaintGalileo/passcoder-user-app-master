import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View, RefreshControl, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather, FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../../utils/Url';
import { AppColor } from '../../../utils/Color';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { date_str_alt } from '../../../utils/Validations';

export default function AdditionalView() {

	const nav = useNavigation();
	const [additional, setAdditional] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isSingleDet, setIsSingleDet] = useState(false)
	const [singleDet, setSingleDet] = useState('');

	async function GetAdditional() {
		setLoading(true);
		const userToken = await AsyncStorage.getItem('userToken');
		fetch(`${BaseUrl}/user/additional/qualifications`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',

			}
		}).then(async (res) => {
			setLoading(false);
			const response = await res.json();
			setAdditional(response.data ? response.data.sort((a, b) => new Date(a.updatedAt.date + " " + a.updatedAt.time).getTime() < new Date(b.updatedAt.date + " " + b.updatedAt.time).getTime() ? 1 : -1) : []);
		}).catch((err) => {
			setLoading(false);
			Toast.show({
				type: 'error',
				text1: "Error",
				text2: "An error occured!"
			})
		})
	}

	async function showSingleAdditional(uniqueId) {
		setLoading(true);
		fetch(`${BaseUrl}/user/additional/qualification`, {
			method: "POST",
			headers: {
				'passcoder-access-token': await AsyncStorage.getItem('userToken'),
				'Accept': 'application/json',
				'Content-Type': 'application/json',

			},
			body: JSON.stringify({ unique_id: uniqueId })
		}).then(async (res) => {
			const response = await res.json();
			setIsSingleDet(true);
			setSingleDet(response.data);
			setLoading(false);
		}).catch((err) => {
			setLoading(false)
			Toast.show({
				type: 'error',
				text1: "Error",
				text2: "An error occured!"
			})
		})

	}

	function hideSingleAdditional() {
		setIsSingleDet(false)
		setSingleDet('')
	}

	useEffect(() => {
		GetAdditional()
	}, [])

	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		GetAdditional().then(() => { setRefreshing(false) }).catch(() => setRefreshing(false));
	}, []);

	async function DeleteAdditionalQualification(id, name) {
		Alert.alert('Delete', `Are you sure you want to delete "${name}" Certificate?`, [
			{
				text: "Cancel"
			}, {
				text: "Yes",
				onPress: async () => {
					const userToken = await AsyncStorage.getItem('userToken')
					fetch(`${BaseUrl}/user/additional/qualification`, {
						method: "DELETE",
						headers: {
							'passcoder-access-token': userToken,
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							unique_id: id
						})
					}).then(async (res) => {

						const response = await res.json();
						if (response.success === true) {
							GetAdditional()
							Toast.show({
								type: "success",
								text1: "Success",
								text2: "Certificate Deleted!"
							})
						} else {
							Toast.show({
								type: "error",
								text1: "Error",
								text2: "An error occured!"
							})
						}
					}).catch(() => {
						GetAdditional()
					})
				}
			}
		])
	};

	const RenderAdditional = ({ item }) => {
		return (
			<>
				<TouchableOpacity onPress={() => { showSingleAdditional(item.unique_id) }} onLongPress={() => DeleteAdditionalQualification(item?.unique_id, item?.name)} style={{ margin: 15 }}>
					<View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
						<View style={{ height: 40, width: 40, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center" }}>
							<FontAwesome5 name="flag-checkered" size={20} color="grey" />
						</View>
						<View style={{ flex: 1, marginLeft: 10 }}>
							<Text style={{ fontFamily: "lexendBold", color: "grey" }}>{item?.name}</Text>
							{
								item?.doc_ref ? 
									<Text style={{ fontFamily: "lexendMedium", color: "grey" }}>{item?.doc_ref}</Text>
									: ""
							}
							<Text style={{ fontFamily: "lexendLight", color: "grey" }}>{date_str_alt(item?.from_year_month).date} - {date_str_alt(item?.to_year_month).date}</Text>
						</View>
						{
							item?.verified ?
								<FontAwesome name="check-circle-o" size={24} color="green" /> :
								<MaterialIcons name="info-outline" size={24} color="coral" />
						}
					</View>
				</TouchableOpacity>
			</>
		)
	}
	return (
		<>
			{
				isSingleDet
					?
					<View style={styles.wrapper}>

						{/*Top*/}
						<View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
							<Feather name="arrow-left" size={24} color="black" onPress={hideSingleAdditional} />
							<View>
								<Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Additional Qualification</Text>
								<Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>All recent qualifications and certificates</Text>
							</View>
							<View>

							</View>
						</View>


						{loading ? (
							<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
								<ActivityIndicator color={AppColor.Blue} size={'large'} />
							</View>
						) : (
							<View>
								<View style={{ margin: 15 }}>
									<View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
										<View style={{ height: 40, width: 40, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center" }}>
											<FontAwesome5 name="flag-checkered" size={20} color="grey" />
										</View>
										<View style={{ flex: 1, marginLeft: 10 }}>
											<Text style={{ fontFamily: "lexendBold", color: "grey" }}>{singleDet?.name}</Text>
											{
												singleDet?.doc_ref ? 
													<Text style={{ fontFamily: "lexendMedium", color: "grey" }}>{singleDet?.doc_ref}</Text>	
													: ""
											}
											<Text style={{ fontFamily: "lexendLight", color: "grey" }}>{date_str_alt(singleDet?.from_year_month).date} - {date_str_alt(singleDet?.to_year_month).date}</Text>
										</View>
										{
											singleDet?.verified ?
												<FontAwesome name="check-circle-o" size={24} color="green" /> :
												<MaterialIcons name="info-outline" size={24} color="coral" />
										}
									</View>

								</View>

								{
									singleDet?.proof ?
										<View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
											<Text style={{ fontFamily: "lexendMedium", marginBottom: 10 }}>Certificate</Text>
											{
												singleDet?.proof.split("/")[4].split(".")[1] !== "PDF" && singleDet?.proof.split("/")[4].split(".")[1] !== "pdf" ?
													<Image style={{ height: 300, width: 250 }} resizeMode='contain' source={{ uri: singleDet?.proof }} /> :
													<Text style={{ fontFamily: "lexendLight", marginBottom: 10 }}>{singleDet?.proof.split("/")[4]}</Text>
											}
										</View> : ""
								}
							</View>
						)}

						{
							!singleDet?.verified && !loading ? (
								<View style={{ position: "absolute", bottom: 0, marginBottom: 20, alignSelf: "center", margin: 15 }}>
									<TouchableOpacity onPress={() => { nav.navigate('AdditionalEdit', singleDet) }} style={{ height: 45, backgroundColor: AppColor.Blue, borderRadius: 8, justifyContent: "center", alignItems: "center", width: 300 }}>
										<Text style={{ fontFamily: 'lexendMedium', color: "#fff" }}>Edit </Text>
									</TouchableOpacity>
								</View>
							) : ""
						}

					</View>
					:
					<View style={styles.wrapper}>

						{/*Top*/}
						<View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
							<Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
							<View>
								<Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Additional Qualification</Text>
								<Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>All recent qualifications and certificates</Text>
							</View>
							<View>

							</View>
						</View>


						{loading ? (
							<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
								<ActivityIndicator color={AppColor.Blue} size={'large'} />
							</View>
						) : (
							<View style={{ marginBottom: 120 }}>
								<FlatList
									refreshing={refreshing}
									refreshControl={
										<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
									}
									renderItem={RenderAdditional}
									data={additional}
								/>
							</View>
						)}

						<View style={{ position: "absolute", bottom: 20, right: 10, margin: 10 }}>
							<TouchableOpacity onPress={() => nav.navigate('AdditionalAdd')} style={{ justifyContent: "center", backgroundColor: "#292482", borderRadius: 50, alignItems: 'center', marginTop: 50 }}>
								<Feather name="plus-circle" size={50} color="#FFFFFF" />
							</TouchableOpacity>
						</View>
					</View>
			}
		</>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
	}
})