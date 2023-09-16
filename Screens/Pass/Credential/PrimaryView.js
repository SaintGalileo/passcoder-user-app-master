import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather, FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../../utils/Url';
import { AppColor } from '../../../utils/Color';

export default function PrimaryView() {

	const nav = useNavigation();

	const [primary, setPrimary] = useState({});
	const [primaryExt, setPrimaryExt] = useState('');
	const [loading, setLoading] = useState(false);

	async function GetPrimary() {
		setLoading(true);
		const userToken = await AsyncStorage.getItem('userToken');
		fetch(`${BaseUrl}/user/primary/school`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		}).then(async (res) => {
			const response = await res.json();
			setPrimary(response.data);
			
			let lastDotPrimary = response.data.proof ? response.data.proof.lastIndexOf('.') : null;
			let extPrimary = response.data.proof ? response.data.proof.substring(lastDotPrimary + 1) : null;
			setPrimaryExt(extPrimary ? extPrimary.toUpperCase() : null);
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
		GetPrimary()
	}, []);

	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		GetPrimary().then(() => { setRefreshing(false) }).catch(() => setRefreshing(false));
	}, []);

	return (
		<View style={styles.wrapper}>

			{/*Top*/}
			<View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
				<Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
				<View>
					<Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Primary School</Text>
					<Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>First school leaving certificate</Text>
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
									<Text style={{ fontFamily: "lexendBold", color: "grey" }}>{primary?.name}</Text>
									<Text style={{ fontFamily: "lexendLight", color: "grey" }}>{primary?.from_year} - {primary?.to_year}</Text>
								</View>
								{
									primary?.verified ?
										<FontAwesome name="check-circle-o" size={24} color="green" /> :
										<MaterialIcons name="info-outline" size={24} color="coral" />
								}
							</View>
						</View>

						{
							primary ?
								<View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
									<Text style={{ fontFamily: "lexendMedium", marginBottom: 10 }}>Certificate</Text>
									{
										primaryExt !== "PDF" ?
											<Image style={{ height: 300, width: 250 }} resizeMode='contain' source={{ uri: primary?.proof }} /> :
											<Text style={{ fontFamily: "lexendLight", marginBottom: 10 }}>{primary?.proof.split("/")[4]}</Text>
									}
								</View> : ""
						}

					</ScrollView>

					{
						!primary?.verified && !loading ? (
							<View style={{ position: "absolute", bottom: 0, marginBottom: 20, alignSelf: "center" }}>
								<TouchableOpacity onPress={() => {
									nav.navigate('EditPrimary')
								}} style={{ height: 45, backgroundColor: AppColor.Blue, borderRadius: 8, justifyContent: "center", alignItems: "center", width: 300 }}>
									<Text style={{ color: "#fff", fontFamily: "lexendMedium" }}>Edit</Text>
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