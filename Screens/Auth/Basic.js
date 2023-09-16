import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View, Linking, Platform } from 'react-native';
import React, { useRef, useState } from 'react';
import { Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AppColor } from '../../utils/Color';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { validate_past_date, validate_pg_age_signup, pg_age, return_all_letters_uppercase } from '../../utils/Validations';
import Toast from 'react-native-toast-message';
import Modal from "react-native-modal";

export default function Basic({ route }) {

    //data state
    const [date, setDate] = useState('');
    const [referralCode, setReferralCode] = useState('');

    const [open, setOpen] = useState(false)

    //nav props
    const nav = useNavigation();

    //collect the data from the parent screen
    const { firstname, lastname, middlename, email, phone_number } = route.params;

    //state to hold gender
    const [gender, setGender] = useState("Male");
    const [genderModal, setGenderModal] = useState(false);

    const [isPickerShowDOBDate, setIsPickerShowDOBDate] = useState(false);
	const [dateDOBDate, setDateDOBDate] = useState(new Date(Date.now()));

	const showPickerDOBDate = () => {
		setIsPickerShowDOBDate(true);
	};

	const onChangeDOBDate = (event, value) => {
		setDateDOBDate(value);
        setDate(value);
		if (Platform.OS === 'android') {
			setIsPickerShowDOBDate(false);
		}
	};

    //move to next screen
    function nextScreen() {
        const _date_ = new Date(date);
		const _date = _date_.getFullYear() + "-" + ((_date_.getUTCMonth() + 1) < 10 ? "0" + (_date_.getUTCMonth() + 1) : (_date_.getUTCMonth() + 1)) + "-" + (_date_.getDate() < 10 ? "0" + _date_.getDate() : _date_.getDate());
		if (!date) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Select date of birth"
            })
        } else if (!validate_past_date(_date)) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Invalid Date of Birth"
            })
        } else if (!validate_pg_age_signup(_date)) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: `Invalid Date of Birth, PG ${pg_age}`
            })
        } else if (!gender) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Select Gender"
            })
        } else {
            nav.navigate("Password", {
                firstname: firstname,
                lastname: lastname,
                middlename: middlename,
                email: email,
                phone_number: phone_number,
                gender: gender,
                date: _date, 
                ref: referralCode
            })
        }
    };

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
                <View style={styles.topBar}>
                    <Entypo name="chevron-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
                </View>

                {/*Description text*/}
                <View style={styles.descText}>
                    <Text style={styles.bigText}>What's your Basic Details</Text>
                    <Text style={styles.smallText}>Please select your Gender and Date of Birth</Text>
                </View>

                {/*input field*/}
                <View style={styles.mainView}>
                    <Text style={{ fontFamily: 'lexendBold', marginTop: 5, marginBottom: 5 }}>Gender</Text>
                    <TouchableOpacity onPress={() => setGenderModal(true)} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8, marginBottom: 20 }}>
                        <Text style={{ fontFamily: "lexendBold", color: 'grey', paddingLeft: 20 }}>{gender}</Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="grey" style={{ marginRight: 10 }} />
                    </TouchableOpacity>

                    <Text style={{ fontFamily: 'lexendBold', marginTop: 5 }}>Date of Birth</Text>
                    <TouchableOpacity onPress={showPickerDOBDate} style={{ flexDirection: "row", marginTop: 5, marginBottom: 15, backgroundColor: "#eee", height: 45, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                        {(!isPickerShowDOBDate || Platform.OS === "android") && (
                            <Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{date ? `${new Date(date).getFullYear()}-${(new Date(date).getUTCMonth() + 1) < 10 ? "0" + (new Date(date).getUTCMonth() + 1) : (new Date(date).getUTCMonth() + 1)}-${new Date(date).getDate() < 10 ? "0" + new Date(date).getDate() : new Date(date).getDate()}` : "YYYY-MM-DD"}</Text>
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

                    <Text style={{ fontFamily: 'lexendBold', marginTop: 5, marginBottom: 5 }}>Referred by</Text>
                    <TextInput
                        autoCapitalize='characters'
                        onChangeText={(txt) => setReferralCode(return_all_letters_uppercase(txt))}
                        style={styles.textInput}
                        placeholder='Referral Code/ID (optional)' />

                    {/*Next Button*/}
                    <TouchableOpacity style={styles.nextButton} onPress={nextScreen}>
                        <Text style={styles.nextText}>Next</Text>
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
        backgroundColor: AppColor.White
    },
    topBar: {
        margin: 15,
        marginTop: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    descText: {
        margin: 15,
        marginTop: 30
    },
    bigText: {
        fontFamily: "lexendBold",
        color: AppColor.Blue,
        fontSize: 20
    },
    smallText: {
        fontFamily: "lexendMedium",
        color: AppColor.Black,
        marginTop: 10
    },
    mainView: {
        marginTop: 25,
        margin: 15
    },

    nextButton: {
        height: 50,
        backgroundColor: AppColor.Blue,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        marginTop: 47
    },
    nextText: {
        fontFamily: "lexendMedium",
        color: AppColor.White
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