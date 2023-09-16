import { ActivityIndicator, Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import { AppColor } from '../../utils/Color';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';

export default function Otp({ route }) {
    
    //nav props
    const nav = useNavigation();
    const [loading, setLoading] = useState(false);

    const { pid, email } = route.params;
    
    const [otp, setOtp] = useState('');
    const [userPushID, setUserPushID] = useState('');

    //get user token
    useEffect(() => {
        messaging().getToken().then((token) => {
            setUserPushID(token)
        })
    }, [])

    async function VeirfyOTP() {
        if (pid && pid.length > 0) {
            setLoading(true);
            const passToken = await AsyncStorage.getItem('userToken')
            fetch(`${BaseUrl}/auth/user/signin/via/pid/otp/verify`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pid: pid,
                    otp: otp
                })
            }).then(async (res) => {
                const response = await res.json();
                if (response.success === false) {
                    setLoading(false)
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: res.status !== 422 ? response.message : response.data[0].msg
                    })
                } else {
                    await AsyncStorage.setItem('userToken', response.data.token);
                    await AsyncStorage.setItem('userPID', pid);
                    fetch(`${BaseUrl}/user/profile/pushid/external`, {
                        method: "PUT",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            pid: pid,
                            push_id: userPushID
                        })
                    }).then(async (res) => {
                        setLoading(false);
                        nav.replace("Passcoder");
                    }).catch((err) => {
                        setLoading(false);
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: "An error occured!"
                        });
                    })
                }
            })
        } else if (email && email.length > 0) {
            setLoading(true);
            const passToken = await AsyncStorage.getItem('userToken');
            fetch(`${BaseUrl}/auth/user/signin/via/email/otp/verify`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    otp: otp
                })
            }).then(async (res) => {
                const response = await res.json();
                if (response.success === false) {
                    setLoading(false)
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: res.status !== 422 ? response.message : response.data[0].msg
                    })
                } else {
                    await AsyncStorage.setItem('userToken', response.data.token);
                    await AsyncStorage.setItem('userPID', response.data.pid);
                    await AsyncStorage.setItem('userUID', response.data.uid);
                    await AsyncStorage.setItem('userEmail', email);
                    fetch(`${BaseUrl}/user/profile/pushid/external`, {
                        method: "PUT",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            pid: response.data.pid,
                            push_id: userPushID
                        })
                    }).then(async (res) => {
                        setLoading(false);
                        nav.replace("Passcoder");
                    }).catch((err) => {
                        setLoading(false);
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: "An error occured!"
                        });
                    })
                }
            })
        } else {
            setLoading(true);
            const passToken = await AsyncStorage.getItem('userToken')
            fetch(`${BaseUrl}/user/otp/verify`, {
                method: "POST",
                headers: {
                    'passcoder-access-token': passToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    otp: otp
                })
            }).then(async (res) => {
                const response = await res.json();
                if (response.success === false) {
                    setLoading(false)
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: res.status !== 422 ? response.message : response.data[0].msg
                    })
                } else {
                    fetch(`${BaseUrl}/user/profile/pushid`, {
                        method: "PUT",
                        headers: {
                            'passcoder-access-token': passToken,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            push_id: userPushID
                        })
                    }).then(async (res) => {
                        setLoading(false);
                        nav.replace("Passcoder");
                    }).catch((err) => {
                        setLoading(false);
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: "An error occured!"
                        });
                    })
                }
            })
        }
    }

    useEffect(() => {
        if (otp.length === 6) {
            VeirfyOTP()
        }
    }, [otp])

    return (
        Platform.OS === "ios" ?
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.wrapper}>

                        {/*Top bar*/}
                        <View style={styles.topBar}>
                            <Entypo name="chevron-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
                            {/* <FontAwesome name="question" size={24} color={AppColor.Blue} /> */}
                        </View>

                        {/*Description text*/}
                        <View style={styles.descText}>
                            <Text style={styles.bigText}>Enter 2FA</Text>
                            <Text style={styles.smallText}>Please enter the 6 digit code sent to your email</Text>
                        </View>

                        {/*Phone input*/}
                        <View style={styles.mainView}>
                            <View style={{ height: 50, backgroundColor: AppColor.LightGrey, borderRadius: 12 }}>
                                <TextInput
                                    onChangeText={(txt) => {
                                        setOtp(txt)
                                    }}
                                    maxLength={6}
                                    keyboardType='number-pad'
                                    style={styles.textInput}
                                    placeholder='OTP' />
                            </View>

                            {/* <View style={{ alignSelf: "center", marginTop: 50, flexDirection: "row", alignItems: "center" }}>
                                <Text style={{ fontFamily: "lexendLight", color: AppColor.Black }}>Didn't receive a code?</Text>
                                <TouchableOpacity style={{ justifyContent: "center", alignItems: "center", backgroundColor: "#FC7C04", padding: 10, borderRadius: 100, marginLeft: 5 }}>
                                    <Text style={{ color: AppColor.White, fontFamily: "lexendMedium" }}>Resend</Text>
                                </TouchableOpacity>
                            </View> */}

                        </View>

                        {/*Next Button*/}
                        <TouchableOpacity disabled={loading} style={styles.nextButton} onPress={VeirfyOTP}>
                            {loading ? (
                                <ActivityIndicator color={'#fff'} size={'small'} />
                            ) : (
                                <Text style={styles.nextText}>Verify OTP</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView> :
            <View style={styles.wrapper}>

                {/*Top bar*/}
                <View style={styles.topBar}>
                    <Entypo name="chevron-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
                    {/* <FontAwesome name="question" size={24} color={AppColor.Blue} /> */}
                </View>

                {/*Description text*/}
                <View style={styles.descText}>
                    <Text style={styles.bigText}>Enter 2FA</Text>
                    <Text style={styles.smallText}>Please enter the 6 digit code sent to your email</Text>
                </View>

                {/*Phone input*/}
                <View style={styles.mainView}>
                    <View style={{ height: 50, backgroundColor: AppColor.LightGrey, borderRadius: 12 }}>
                        <TextInput
                            onChangeText={(txt) => {
                                setOtp(txt)
                            }}
                            maxLength={6}
                            keyboardType='number-pad'
                            style={styles.textInput}
                            placeholder='OTP' />
                    </View>

                    {/* <View style={{ alignSelf: "center", marginTop: 50, flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ fontFamily: "lexendLight", color: AppColor.Black }}>Didn't receive a code?</Text>
                        <TouchableOpacity style={{ justifyContent: "center", alignItems: "center", backgroundColor: "#FC7C04", padding: 10, borderRadius: 100, marginLeft: 5 }}>
                            <Text style={{ color: AppColor.White, fontFamily: "lexendMedium" }}>Resend</Text>
                        </TouchableOpacity>
                    </View> */}

                </View>

                {/*Next Button*/}
                <TouchableOpacity disabled={loading} style={styles.nextButton} onPress={VeirfyOTP}>
                    {loading ? (
                        <ActivityIndicator color={'#fff'} size={'small'} />
                    ) : (
                        <Text style={styles.nextText}>Verify OTP</Text>
                    )}
                </TouchableOpacity>
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
    textInput: {
        fontFamily: "lexendBold",
        paddingLeft: 15,
        flex: 1
    },
    nextButton: {
        height: 50,
        backgroundColor: AppColor.Blue,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        marginTop: 25,
        position: "absolute",
        bottom: 0,
        marginBottom: 20,
        alignSelf: "center",
        width: 300
    },
    nextText: {
        fontFamily: "lexendMedium",
        color: AppColor.White
    }
})