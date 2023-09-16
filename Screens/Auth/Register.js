import { Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useContext, useState } from 'react'
import { AppColor } from '../../utils/Color'
import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { validate_email, validate_phone_number } from '../../utils/Validations';

export default function Register() {
    const nav = useNavigation();

    //use states 
    const [firstname, setFirstname] = useState('');
    const [middlename, setMiddlename] = useState(null);
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [phone_number, setPhoneNumber] = useState('');

    // Validations

    //next screen function
    function nextScreen() {
        if (!firstname) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Enter your First Name"
            })
        } else if (firstname.length < 1 || firstname.length > 50) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "First Name | Invalid length"
            })
        } else if (middlename && (middlename.length < 1 || middlename.length > 50)) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Middle Name | Invalid length"
            })
        } else if (!lastname) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Enter your Last Name"
            })
        } else if (lastname.length < 1 || lastname.length > 50) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Last Name | Invalid length"
            })
        } else if (!email) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Enter your Email address"
            })
        } else if (!validate_email(email)) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Invalid email address"
            })
        } else if (!phone_number) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Enter your Phone Number"
            })
        } else if (!validate_phone_number(phone_number)) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Invalid Phone Number"
            })
        } else {
            nav.navigate('Basic', {
                firstname: firstname,
                middlename: middlename,
                lastname: lastname,
                email: email.toLowerCase(),
                phone_number: `+234${phone_number.slice(1)}`
            })
        }
    }

    return (
        Platform.OS === "ios" ?
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.wrapper}>

                        {/*Top bar*/}
                        <View style={styles.topBar}>
                            <Entypo name="chevron-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
                        </View>

                        <View style={{ marginTop: 10, margin: 15, marginBottom: 10 }}>
                            <Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, fontSize: 25 }}>Sign Up</Text>
                            <Text style={{ fontFamily: "lexendLight", marginTop: 5 }}>Make sure the information provided is same in your government issued documents.</Text>
                        </View>

                        <ScrollView showsHorizontalScrollIndicator={false} style={{ margin: 15 }}>
                            <Text style={{ fontFamily: 'lexendBold', marginTop: 5, marginBottom: 5 }}>First name</Text>
                            <TextInput
                                onChangeText={(txt) => setFirstname(txt)}
                                style={styles.textInput}
                                placeholder='Enter legal first name' />
                            <Text style={{ fontFamily: 'lexendBold', marginTop: 5, marginBottom: 5 }}>Middle name</Text>
                            <TextInput
                                onChangeText={(txt) => setMiddlename(txt)}
                                style={styles.textInput}
                                placeholder='Enter legal middle name' />
                            <Text style={{ fontFamily: 'lexendBold', marginTop: 5, marginBottom: 5 }}>Last name</Text>
                            <TextInput
                                onChangeText={(txt) => setLastname(txt)}
                                style={styles.textInput}
                                placeholder='Enter legal last name' />
                            <Text style={{ fontFamily: 'lexendBold', marginTop: 5, marginBottom: 5 }}>Email</Text>
                            <TextInput
                                onChangeText={(txt) => setEmail(txt)}
                                style={styles.textInput}
                                placeholder='Enter email address' />
                            <Text style={{ fontFamily: 'lexendBold', marginBottom: 5 }}>Phone Number</Text>
                            {/* <Text style={{ fontFamily: 'lexendLight', marginTop: 5, marginBottom: 5 }}>With country code (e.g. +234)</Text> */}
                            <TextInput
                                keyboardType='phone-pad'
                                maxLength={11}
                                onChangeText={(txt) => setPhoneNumber(txt)}
                                style={[styles.textInput, { flex: 1 }]}
                                placeholder='e.g 08011111111' />

                        </ScrollView>
                        <TouchableOpacity style={styles.nextButton} onPress={nextScreen}>
                            <Text style={styles.nextText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView> :
            <View style={styles.wrapper}>

                {/*Top bar*/}
                <View style={styles.topBar}>
                    <Entypo name="chevron-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
                </View>

                <View style={{ marginTop: 10, margin: 15, marginBottom: 10 }}>
                    <Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, fontSize: 25 }}>Sign Up</Text>
                    <Text style={{ fontFamily: "lexendLight", marginTop: 5 }}>Make sure the information provided is same in your government issued documents.</Text>
                </View>

                <ScrollView showsHorizontalScrollIndicator={false} style={{ margin: 15 }}>
                    <Text style={{ fontFamily: 'lexendBold', marginTop: 5, marginBottom: 5 }}>First name</Text>
                    <TextInput
                        onChangeText={(txt) => setFirstname(txt)}
                        style={styles.textInput}
                        placeholder='Enter legal first name' />
                    <Text style={{ fontFamily: 'lexendBold', marginTop: 5, marginBottom: 5 }}>Middle name</Text>
                    <TextInput
                        onChangeText={(txt) => setMiddlename(txt)}
                        style={styles.textInput}
                        placeholder='Enter legal middle name' />
                    <Text style={{ fontFamily: 'lexendBold', marginTop: 5, marginBottom: 5 }}>Last name</Text>
                    <TextInput
                        onChangeText={(txt) => setLastname(txt)}
                        style={styles.textInput}
                        placeholder='Enter legal last name' />
                    <Text style={{ fontFamily: 'lexendBold', marginTop: 5, marginBottom: 5 }}>Email</Text>
                    <TextInput
                        onChangeText={(txt) => setEmail(txt)}
                        style={styles.textInput}
                        placeholder='Enter email address' />
                    <Text style={{ fontFamily: 'lexendBold', marginBottom: 5 }}>Phone Number</Text>
                    {/* <Text style={{ fontFamily: 'lexendLight', marginTop: 5, marginBottom: 5 }}>With country code (e.g. +234)</Text> */}
                    <TextInput
                        keyboardType='phone-pad'
                        maxLength={11}
                        onChangeText={(txt) => setPhoneNumber(txt)}
                        style={[styles.textInput, { flex: 1 }]}
                        placeholder='e.g 08011111111' />

                </ScrollView>
                <TouchableOpacity style={styles.nextButton} onPress={nextScreen}>
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>
            </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff"
    },
    topBar: {
        margin: 15,
        marginTop: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    textInput: {
        backgroundColor: "#eee",
        height: 50,
        borderRadius: 8,
        paddingLeft: 20,
        fontFamily: "lexendBold",
        marginBottom: 20
    },
    flagWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e8e8e8",
        padding: 5,
        margin: 5,
        borderRadius: 100
    },
    nextButton: {
        height: 50,
        backgroundColor: AppColor.Blue,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        margin: 20
    },
    nextText: {
        fontFamily: "lexendMedium",
        color: AppColor.White
    }
})