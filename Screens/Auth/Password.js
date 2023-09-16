import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import { AppColor } from '../../utils/Color';
import { useNavigation } from '@react-navigation/native';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import * as Linking from 'expo-linking';
import { date_str, validate_password, return_trimmed_data, validate_password_field_1, validate_password_field_2, validate_password_field_3 } from '../../utils/Validations';

export default function Password({ route }) {

    //collect the data from the previous screen
    const { firstname, lastname, middlename, email, phone_number, date, gender, ref } = route.params;

    const [seePass1, setPass1] = useState(true);
    const [seePass2, setPass2] = useState(true);

    const [passwordStrong, setPasswordStrong] = useState(0);

    //nav props
    const nav = useNavigation();

    //it loadimg
    const [loading, setLoading] = useState(false);

    //sign up function
    async function CreateUser() {
        setLoading(true);
        if (ref && ref.length > 0) {
            fetch(`${BaseUrl}/auth/user/signup/${ref}`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({
                    firstname: return_trimmed_data(firstname) || null,
                    middlename: return_trimmed_data(middlename) || undefined,
                    lastname: return_trimmed_data(lastname) || null,
                    gender: gender || null,
                    dob: date_str(date) || null,
                    phone_number: return_trimmed_data(phone_number) || null,
                    email: return_trimmed_data(email),
                    password: password.toString(),
                    confirmPassword: confirmPassword.toString(),
                    country: "Nigeria" || null
                })
            })
            .then((response) => response.json())
            .then((responseJson) => {
                setLoading(false);
                if (responseJson.success) {
                    Toast.show({
                        type: "success",
                        text1: "Success",
                        text2: "Email verification link sent!"
                    });
                    nav.replace("Email");
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: !responseJson.data[0] ? responseJson.message : responseJson.data[0].msg
                    })
                }
            })
            .catch((error) => {
                setLoading(false);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "An error occured!"
                })
            });
        } else {
            fetch(`${BaseUrl}/auth/user/signup`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
    
                },
                body: JSON.stringify({
                    firstname: return_trimmed_data(firstname) || null,
                    middlename: return_trimmed_data(middlename) || undefined,
                    lastname: return_trimmed_data(lastname) || null,
                    gender: gender || null,
                    dob: date_str(date) || null,
                    phone_number: return_trimmed_data(phone_number) || null,
                    email: return_trimmed_data(email),
                    password: password.toString(),
                    confirmPassword: confirmPassword.toString(),
                    country: "Nigeria" || null
                })
            })
            .then((response) => response.json())
            .then((responseJson) => {
                setLoading(false);
                if (responseJson.success) {
                    Toast.show({
                        type: "success",
                        text1: "Success",
                        text2: "Email verification link sent!"
                    });
                    nav.replace("Email");
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: !responseJson.data[0] ? responseJson.message : responseJson.data[0].msg
                    })
                }

            })
            .catch((error) => {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "An error occured!"
                })
                setLoading(false);
            });
        }
    }

    const [read, setRead] = useState(false);

    //password states
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirm] = useState();

    //move to the next screen
    function nextScreen() {
        if (!password) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please choose a password"
            })

        } else if (!validate_password(password)) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Weak password"
            })
        } else if (!confirmPassword) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please confirm password"
            })
        } else if (confirmPassword !== password) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Passwords not matching!"
            })
        } else if (!read) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Accept the Terms and conditions "
            })
        } else {
            CreateUser()
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

                        {/*Description text*/}
                        <View style={styles.descText}>
                            <Text style={styles.bigText}>Create Password</Text>
                            <Text style={styles.smallText}>Please create a unique password </Text>
                        </View>

                        {/*password input*/}
                        <View style={styles.mainView}>
                            <Text style={{ fontFamily: 'lexendBold', marginBottom: 5 }}>Password</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#eee", height: 50, justifyContent: "center", borderRadius: 8, marginBottom: passwordStrong === 0 || passwordStrong === 5 ? 20 : 0 }}>
                                <TextInput
                                    secureTextEntry={seePass1}
                                    onChangeText={(txt) => { 
                                        setPassword(txt);
                                        if (txt.length < 8) {
                                            setPasswordStrong(1);
                                        } else if (txt.length > 8 && !validate_password_field_1(txt)) {
                                            setPasswordStrong(2);
                                        } else if (txt.length > 8 && !validate_password_field_2(txt)) {
                                            setPasswordStrong(3);
                                        } else if (txt.length > 8 && !validate_password_field_3(txt)) {
                                            setPasswordStrong(4);
                                        } else if (txt.length > 8 && validate_password_field_1(txt) && validate_password_field_2(txt) && validate_password_field_3(txt)) {
                                            setPasswordStrong(5);
                                        }
                                    }}
                                    maxLength={30}
                                    style={[styles.textInput, { flex: 1, backgroundColor: null, marginBottom: 0 }]}
                                    placeholder='Create Password' />
                                <TouchableOpacity onPress={() => setPass1(!seePass1)}>
                                    <Ionicons name={!seePass1 ? "eye-off" : 'eye'} size={24} color="grey" style={{ marginRight: 15 }} />
                                </TouchableOpacity>
                            </View>
                            {passwordStrong === 1 && <Text style={{ fontFamily: 'lexendLight', color: "red", marginTop: 5, marginBottom: 20 }}>Minimum of 8 characters</Text> }
                            {passwordStrong === 2 && <Text style={{ fontFamily: 'lexendLight', color: "red", marginTop: 5, marginBottom: 20 }}>Must contain upper & lower case</Text>}
                            {passwordStrong === 3 && <Text style={{ fontFamily: 'lexendLight', color: "red", marginTop: 5, marginBottom: 20 }}>Must contain numbers</Text>}
                            {passwordStrong === 4 && <Text style={{ fontFamily: 'lexendLight', color: "red", marginTop: 5, marginBottom: 20 }}>Must contain special characters</Text>}

                            <Text style={{ fontFamily: 'lexendBold', marginTop: 5, marginBottom: 5 }}>Confirm Password</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#eee", height: 50, marginBottom: 20, justifyContent: "center", borderRadius: 8 }}>
                                <TextInput
                                    secureTextEntry={seePass2}
                                    onChangeText={(txt) => setConfirm(txt)}
                                    maxLength={30}
                                    style={[styles.textInput, { flex: 1, backgroundColor: null, marginBottom: 0 }]}
                                    placeholder='Confirm Password' />
                                <TouchableOpacity onPress={() => setPass2(!seePass2)}>
                                    <Ionicons name={!seePass2 ? "eye-off" : 'eye'} size={24} color="grey" style={{ marginRight: 15 }} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <TouchableOpacity onPress={() => setRead(!read)}>
                                    <View style={{ width: 20, backgroundColor: !read ? "white" : AppColor.Blue, height: 20, borderWidth: !read ? 1.5 : null, borderColor: !read ? "grey" : null, borderRadius: 2 }} />
                                </TouchableOpacity>
                                <View style={{ marginLeft: 10 }}>
                                    <TouchableOpacity onPress={() => setRead(!read)}>
                                        <Text style={{ fontSize: 12, fontFamily: "lexendMedium" }}>I have read, understood and agree to PassCoder</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        Linking.openURL('https://passcoder.io/terms');
                                    }}>
                                        <Text style={{ fontSize: 12, fontFamily: "lexendMedium", color: AppColor.Blue }}>Terms & Conditions and Privacy Policy</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/*Next Button*/}
                            <TouchableOpacity style={styles.nextButton} onPress={nextScreen}>

                                {loading ? (
                                    <ActivityIndicator color={"#fff"} size='small' />
                                ) : (
                                    <Text style={styles.nextText}>Next</Text>
                                )}

                            </TouchableOpacity>
                        </View>

                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView> :
            <View style={styles.wrapper}>

                {/*Top bar*/}
                <View style={styles.topBar}>
                    <Entypo name="chevron-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
                </View>

                {/*Description text*/}
                <View style={styles.descText}>
                    <Text style={styles.bigText}>Create Password</Text>
                    <Text style={styles.smallText}>Please create a unique password </Text>
                </View>

                {/*password input*/}
                <View style={styles.mainView}>
                    <Text style={{ fontFamily: 'lexendBold', marginBottom: 5 }}>Password</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#eee", height: 50, justifyContent: "center", borderRadius: 8, marginBottom: passwordStrong === 0 || passwordStrong === 5 ? 20 : 0 }}>
                        <TextInput
                            secureTextEntry={seePass1}
                            onChangeText={(txt) => { 
                                setPassword(txt);
                                if (txt.length < 8) {
                                    setPasswordStrong(1);
                                } else if (txt.length > 8 && !validate_password_field_1(txt)) {
                                    setPasswordStrong(2);
                                } else if (txt.length > 8 && !validate_password_field_2(txt)) {
                                    setPasswordStrong(3);
                                } else if (txt.length > 8 && !validate_password_field_3(txt)) {
                                    setPasswordStrong(4);
                                } else if (txt.length > 8 && validate_password_field_1(txt) && validate_password_field_2(txt) && validate_password_field_3(txt)) {
                                    setPasswordStrong(5);
                                }
                            }}
                            maxLength={30}
                            style={[styles.textInput, { flex: 1, backgroundColor: null, marginBottom: 0 }]}
                            placeholder='Create Password' />
                        <TouchableOpacity onPress={() => setPass1(!seePass1)}>
                            <Ionicons name={!seePass1 ? "eye-off" : 'eye'} size={24} color="grey" style={{ marginRight: 15 }} />
                        </TouchableOpacity>
                    </View>
                    {passwordStrong === 1 && <Text style={{ fontFamily: 'lexendLight', color: "red", marginTop: 5, marginBottom: 20 }}>Minimum of 8 characters</Text> }
                    {passwordStrong === 2 && <Text style={{ fontFamily: 'lexendLight', color: "red", marginTop: 5, marginBottom: 20 }}>Must contain upper & lower case</Text>}
                    {passwordStrong === 3 && <Text style={{ fontFamily: 'lexendLight', color: "red", marginTop: 5, marginBottom: 20 }}>Must contain numbers</Text>}
                    {passwordStrong === 4 && <Text style={{ fontFamily: 'lexendLight', color: "red", marginTop: 5, marginBottom: 20 }}>Must contain special characters</Text>}

                    <Text style={{ fontFamily: 'lexendBold', marginTop: 5, marginBottom: 5 }}>Confirm Password</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#eee", height: 50, marginBottom: 20, justifyContent: "center", borderRadius: 8 }}>
                        <TextInput
                            secureTextEntry={seePass2}
                            onChangeText={(txt) => setConfirm(txt)}
                            maxLength={30}
                            style={[styles.textInput, { flex: 1, backgroundColor: null, marginBottom: 0 }]}
                            placeholder='Confirm Password' />
                        <TouchableOpacity onPress={() => setPass2(!seePass2)}>
                            <Ionicons name={!seePass2 ? "eye-off" : 'eye'} size={24} color="grey" style={{ marginRight: 15 }} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => setRead(!read)}>
                            <View style={{ width: 20, backgroundColor: !read ? "white" : AppColor.Blue, height: 20, borderWidth: !read ? 1.5 : null, borderColor: !read ? "grey" : null, borderRadius: 2 }} />
                        </TouchableOpacity>
                        <View style={{ marginLeft: 10 }}>
                            <TouchableOpacity onPress={() => setRead(!read)}>
                                <Text style={{ fontSize: 12, fontFamily: "lexendMedium" }}>I have read, understood and agree to PassCoder</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                Linking.openURL('https://passcoder.io/terms');
                            }}>
                                <Text style={{ fontSize: 12, fontFamily: "lexendMedium", color: AppColor.Blue }}>Terms & Conditions and Privacy Policy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/*Next Button*/}
                    <TouchableOpacity style={styles.nextButton} onPress={nextScreen}>

                        {loading ? (
                            <ActivityIndicator color={"#fff"} size='small' />
                        ) : (
                            <Text style={styles.nextText}>Next</Text>
                        )}

                    </TouchableOpacity>
                </View>

            </View>
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
        marginTop: 40,
        margin: 15
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
        marginTop: 47
    },
    nextText: {
        fontFamily: "lexendMedium",
        color: AppColor.White
    },
    textInput: {
        backgroundColor: "#eee",
        height: 50,
        borderRadius: 8,
        paddingLeft: 20,
        fontFamily: "lexendBold",
        marginBottom: 20,
        fontSize: 15
    },
})