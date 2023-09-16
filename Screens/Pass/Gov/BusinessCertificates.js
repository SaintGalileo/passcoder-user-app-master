import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, RefreshControl, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather, FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import { BaseUrl } from '../../../utils/Url';
import { AppColor } from '../../../utils/Color';
import { date_str_alt } from '../../../utils/Validations';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BusinessCertificates() {

	const nav = useNavigation();
	const [cacs, setCACs] = useState([]);
	const [loading, setLoading] = useState(false);

	async function GetCACs() {
		setLoading(true);
		const userToken = await AsyncStorage.getItem('userToken');
		fetch(`${BaseUrl}/user/cac/all`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',

			}
		}).then(async (res) => {
			setLoading(false);
			const response = await res.json();
			setCACs(response.data ? response.data.sort((a, b) => new Date(a.updatedAt.date + " " + a.updatedAt.time).getTime() < new Date(b.updatedAt.date + " " + b.updatedAt.time).getTime() ? 1 : -1) : []);
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
		GetCACs()
	}, [])

	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		GetCACs().then(() => { setRefreshing(false) }).catch(() => setRefreshing(false));
	}, []);

	async function DeleteCAC(id, name) {
		Alert.alert('Delete', `Are you sure you want to delete "${name}" Business Certificate?`, [
			{
				text: "Cancel"
			}, {
				text: "Yes",
				onPress: async () => {
					const userToken = await AsyncStorage.getItem('userToken')
					fetch(`${BaseUrl}/user/cac`, {
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
							GetCACs()
							Toast.show({
								type: "success",
								text1: "Success",
								text2: "CAC Deleted!"
							})
						} else {
							Toast.show({
								type: "error",
								text1: "Error",
								text2: "An error occured!"
							})
						}
					}).catch(() => {
						GetCACs()
					})
				}
			}
		])
	};

	const editScreen = (data) => {
		nav.navigate('EditBusinessCertificate', {
			unique_id: data.unique_id, company_name: data.company_name, company_email: data.company_email, company_rc_number: data.company_rc_number, company_type: data.company_type, company_address: data.company_address, website_url: data.website_url, registration_date: data.registration_date,
			registration_certificate: data.registration_certificate, registration_document: data.registration_document, verified: data.verified
		});
	};

	const RenderCAC = ({ item }) => {
		return (
			<>
				<TouchableOpacity onPress={() => editScreen(item)} onLongPress={() => DeleteCAC(item?.unique_id, item?.company_name)}>
					<View style={{ margin: 15 }}>
						<View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
							<View style={{ height: 40, width: 40, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center" }}>
								<FontAwesome5 name="flag-checkered" size={20} color="grey" />
							</View>
							<View style={{ flex: 1, marginLeft: 10 }}>
								<Text style={{ fontFamily: "lexendBold", color: "grey" }}>{item?.company_name}</Text>
								<Text style={{ fontFamily: "lexendMedium", color: "grey" }}>{item?.company_type} - {item?.company_rc_number}</Text>
								<Text style={{ fontFamily: "lexendLight", color: "grey" }}>Reg Date: {date_str_alt(item?.registration_date).date}</Text>
							</View>
							{
								item?.verified ?
									<FontAwesome name="check-circle-o" size={24} color="green" /> :
									<MaterialIcons name="info-outline" size={24} color="coral" />
							}
						</View>
					</View>
				</TouchableOpacity>
			</>
		)
	}

	return (
		<View style={styles.wrapper}>

			{/*Top*/}
			<View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
				<Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
				<View>
					<Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>CAC</Text>
					<Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>View, Add and Edit business certificates</Text>
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
					<FlatList
						refreshing={refreshing}
						refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
						}
						renderItem={RenderCAC}
						data={cacs}
					/>
				</View>
			)}

			<View style={{ position: "absolute", bottom: 20, right: 10, margin: 10 }}>
				<TouchableOpacity onPress={() => nav.navigate('AddBusinessCertificate')} style={{ justifyContent: "center", backgroundColor: "#3399ff", borderRadius: 50, alignItems: 'center', marginTop: 50 }}>
					<Feather name="plus-circle" size={50} color="#FFFFFF" />
				</TouchableOpacity>
			</View>

		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
	}
})