import { ActivityIndicator, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppColor } from '../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import Modal from "react-native-modal";

export default function UpdateDob({ route }) {
	const { user } = route.params;

	//nav props
	const nav = useNavigation();

	//some state
	const [dob, setDob] = useState(user?.dob);
	const [gender, setGender] = useState(user?.gender);

	const [genderModal, setGenderModal] = useState(false);

	const [isPickerShowDOBDate, setIsPickerShowDOBDate] = useState(false);
	const [dateDOBDate, setDateDOBDate] = useState(new Date(user?.dob || Date.now()));

	const showPickerDOBDate = () => {
		setIsPickerShowDOBDate(true);
	};

	const onChangeDOBDate = (event, value) => {
		setDateDOBDate(value);
		setDob(value);
		if (Platform.OS === 'android') {
			setIsPickerShowDOBDate(false);
		}
	};

	//loading state
	const [loading, setLoading] = useState(false)

	async function UpdateUserDob() {
		const _date_ = new Date(dob);
		const _date = _date_.getFullYear() + "-" + ((_date_.getUTCMonth() + 1) < 10 ? "0" + (_date_.getUTCMonth() + 1) : (_date_.getUTCMonth() + 1)) + "-" + (_date_.getDate() < 10 ? "0" + _date_.getDate() : _date_.getDate());

		setLoading(true);
		Keyboard.dismiss();
		const userToken = await AsyncStorage.getItem('userToken');

		fetch(`${BaseUrl}/user/profile/details`, {
			method: "PUT",
			headers: {
				'passcoder-access-token': userToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',

			},
			body: JSON.stringify({
				dob: _date || user?.dob,
				gender: gender || user?.gender,
			})
		}).then(async (res) => {
			setLoading(false);
			const response = await res.json();
			if (response.success) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: "Updated successfully!"
				})
				nav.goBack();
			} else {
				Toast.show({
					type: "error",
					text1: "Error",
					text2: res.status !== 422 ? response.message : response.data[0].msg
				})
			}
		}).catch((err) => {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "An error occured!"
			})
		})
	}

	const RenderGenderModal = () => {
		return (
			<Modal onBackdropPress={() => setGenderModal(false)} onBackButtonPress={() => setGenderModal(false)} isVisible={genderModal} style={{ margin: 0 }}>
				<View style={{ flex: 1 }}>
					<View style={{ height: 170, width: Dimensions.get('screen').width, backgroundColor: "#fff", bottom: 0, position: "absolute" }}>
						<Text style={{ margin: 15, fontFamily: "lexendMedium", color: "red" }} onPress={() => setGenderModal(false)}>Cancel</Text>
						<View style={{ height: 5, width: Dimensions.get('screen').width, backgroundColor: "#eee" }} />
						<View style={{ margin: 15 }}>
							<TouchableOpacity style={{ marginBottom: 30 }} onPress={() => {
								setGender('Male');
								setGenderModal(false)
							}}>
								<Text style={{ fontFamily: "lexendBold", color: `${gender === "Male" ? "blue" : null}` }}>Male</Text>
							</TouchableOpacity>
							<TouchableOpacity style={{ marginBottom: 10 }} onPress={() => {
								setGender('Female');
								setGenderModal(false)
							}}>
								<Text style={{ fontFamily: "lexendBold", color: `${gender === "Female" ? "blue" : null}` }}>Female</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		)
	};

	return (
		<>
			<RenderGenderModal />
			<View style={styles.wrapper}>

				{/*Top bar*/}
				<View style={{ flexDirection: "row", alignItems: "center", marginTop: 50, margin: 15 }}>
					<Feather name="arrow-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
					<Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, fontSize: 20, marginLeft: 10 }}>Update Details</Text>
				</View>

				<View style={{ margin: 15, marginTop: 20 }}>
					<View style={{ marginBottom: 20 }}>
						<Text style={styles.topInfo}>Date of Birth</Text>
						<TouchableOpacity onPress={showPickerDOBDate} style={{ flexDirection: "row", marginTop: 5, marginBottom: 15, backgroundColor: "#eee", height: 45, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
							{(!isPickerShowDOBDate || Platform.OS === "android") && (
								<Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{dob ? `${new Date(dob).getFullYear()}-${(new Date(dob).getUTCMonth() + 1) < 10 ? "0" + (new Date(dob).getUTCMonth() + 1) : (new Date(dob).getUTCMonth() + 1)}-${new Date(dob).getDate() < 10 ? "0" + new Date(dob).getDate() : new Date(dob).getDate()}` : "YYYY-MM-DD"}</Text>
							)}
							{(isPickerShowDOBDate && Platform.OS === "ios") && (
								<DateTimePicker
									value={dateDOBDate}
									mode={'date'}
									maximumDate={new Date()}
									display={Platform.OS === 'ios' ? 'default' : 'spinner'}
									is24Hour={true}
									onChange={onChangeDOBDate}
								/>
							)}
							<Ionicons name="calendar-sharp" size={24} color="grey" style={{ marginRight: 10 }} />
						</TouchableOpacity>
					</View>
					<View style={{ marginBottom: 20 }}>
						<Text style={styles.topInfo}>Gender</Text>
						<TouchableOpacity onPress={() => setGenderModal(true)} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8, marginBottom: 20 }}>
							<Text style={{ fontFamily: "lexendBold", color: 'grey', paddingLeft: 20 }}>{gender}</Text>
							<MaterialIcons name="arrow-drop-down" size={24} color="grey" style={{ marginRight: 10 }} />
						</TouchableOpacity>
					</View>
				</View>

				<View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: 20 }}>
					<TouchableOpacity disabled={loading} style={styles.btnStyle} onPress={UpdateUserDob}>
						{loading ? (
							<ActivityIndicator color="#fff" size={'small'} />
						) : (
							<Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Update</Text>
						)}
					</TouchableOpacity>
				</View>

				{/* The date picker */}
				{(isPickerShowDOBDate && Platform.OS === "android") && (
					<DateTimePicker
						value={dateDOBDate}
						mode={'date'}
						maximumDate={new Date()}
						display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
						is24Hour={true}
						onChange={onChangeDOBDate}
						style={styles.datePicker}
					/>
				)}
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: "#fff"
	},
	topInfo: {
		fontFamily: "lexendBold",
		fontSize: 15,
		marginBottom: 5
	},
	inputStyle: {
		height: 50,
		borderRadius: 8,
		backgroundColor: "#eee",
		paddingLeft: 20,
		fontFamily: "lexendMedium",
		fontSize: 15
	},
	btnStyle: {
		height: 50,
		backgroundColor: AppColor.Blue,
		justifyContent: "center",
		alignItems: "center",
		width: 300,
		borderRadius: 8
	},
	textInput: {
		height: 50,
		backgroundColor: AppColor.LightGrey,
		borderRadius: 12,
		paddingLeft: 20,
		fontFamily: "lexendBold",
		marginBottom: 20
	},
	// This only works on iOS
	datePicker: {
		width: Dimensions.get('screen').width,
		height: 200,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'flex-start'
	},
})