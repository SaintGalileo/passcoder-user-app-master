import { ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { AppColor } from '../../utils/Color'
import { Entypo, Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message';
import { BaseUrl } from '../../utils/Url';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function SecondUpdatePin({ route }) {
    const { Pin } = route.params
    //nav props
    const nav = useNavigation();

    //our states
    const [otpCode, setOTPCode] = useState("");
    const [isPinReady, setIsPinReady] = useState(false);
    const maximumCodeLength = 4;

    const boxArray = new Array(maximumCodeLength).fill(0);
    const [loading, setLoading] = useState(false)

    //our ref
    const inputRef = useRef();

    //onblur
    const handleOnBlur = () => { };

    const boxDigit = (_, index) => {
        const emptyInput = "";
        const digit = otpCode[index] || emptyInput;
        return (
            <View style={styles.boxes} key={index}>
                <Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, textAlign: "center", fontSize: 18 }}>{digit}</Text>
            </View>
        );
    };

    async function Updatepin() {
        setLoading(true);
        Keyboard.dismiss()
        const userToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/user/pin/edit`, {
            method: "PUT",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            },
            body: JSON.stringify({
                current_pin: Pin,
                pin: otpCode
            })
        }).then(async (res) => {
            const response = await res.json();
            if (response.success) {
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: response.message
                });
                nav.goBack();
                nav.goBack();
            } else {
                setLoading(false)
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: res.status !== 422 ? response.message : response.data[0].msg
                });
                nav.goBack()
            }
            setLoading(false)
        }).catch((err) => {
            setLoading(false);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "An error occured!"
            })
        })

    }
    return (
        Platform.OS === "ios" ?
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.wrapper}>
                        {/*Top bar*/}
                        <View style={styles.topBar}>
                            <Entypo name="chevron-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
                            <Feather onPress={() => {
                                Linking.openURL('https://passcoder.io/privacy');
                            }} name="info" size={24} color={AppColor.Blue} />
                        </View>

                        <View style={{ margin: 15 }}>
                            <Text style={{ fontFamily: "lexendBold", fontSize: 25, color: AppColor.Blue }}>Enter New Pin</Text>
                            <Text style={{ fontFamily: "lexendLight", marginTop: 5 }}>Your new pin</Text>
                        </View>

                        {/*Four digit pin*/}
                        <View style={styles.otpContainer}>
                            <TouchableOpacity style={styles.touchable}>
                                {boxArray.map(boxDigit)}
                            </TouchableOpacity>
                            <TextInput
                                returnKeyType='next'
                                autoFocus={true}
                                keyboardType='number-pad'
                                ref={inputRef}
                                onBlur={handleOnBlur}
                                maxLength={maximumCodeLength}
                                value={otpCode}
                                onChangeText={(num) => setOTPCode(num)}
                                style={styles.textInput} />
                        </View>

                        <View style={{ justifyContent: "center", alignSelf: "center", marginTop: 30, flexDirection: "row", alignItems: "center", backgroundColor: AppColor.BoldGrey, padding: 10, borderRadius: 100 }}>
                            <Image source={require("../../assets/img/bulb.png")} />
                            <Text style={{ color: AppColor.Black, fontFamily: "lexendMedium" }}>Enter Pin</Text>
                        </View>

                        <View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: Platform.OS === "ios" ? 20 : 20 }}>
                            <TouchableOpacity disabled={loading} onPress={Updatepin} style={{ height: 50, width: 300, borderRadius: 8, backgroundColor: AppColor.Blue, justifyContent: "center", alignItems: "center" }}>
                                {loading ? (
                                    <ActivityIndicator color={"#fff"} size={'small'} />
                                ) : (
                                    <Text style={{ fontFamily: "lexendMedium", color: "#fff", fontSize: 18 }}>Complete</Text>
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
                    <Feather onPress={() => {
                        Linking.openURL('https://passcoder.io/privacy');
                    }} name="info" size={24} color={AppColor.Blue} />
                </View>

                <View style={{ margin: 15 }}>
                    <Text style={{ fontFamily: "lexendBold", fontSize: 25, color: AppColor.Blue }}>Enter New Pin</Text>
                    <Text style={{ fontFamily: "lexendLight", marginTop: 5 }}>Your new pin</Text>
                </View>

                {/*Four digit pin*/}
                <View style={styles.otpContainer}>
                    <TouchableOpacity style={styles.touchable}>
                        {boxArray.map(boxDigit)}
                    </TouchableOpacity>
                    <TextInput
                        returnKeyType='next'
                        autoFocus={true}
                        keyboardType='number-pad'
                        ref={inputRef}
                        onBlur={handleOnBlur}
                        maxLength={maximumCodeLength}
                        value={otpCode}
                        onChangeText={(num) => setOTPCode(num)}
                        style={styles.textInput} />
                </View>

                <View style={{ justifyContent: "center", alignSelf: "center", marginTop: 30, flexDirection: "row", alignItems: "center", backgroundColor: AppColor.BoldGrey, padding: 10, borderRadius: 100 }}>
                    <Image source={require("../../assets/img/bulb.png")} />
                    <Text style={{ color: AppColor.Black, fontFamily: "lexendMedium" }}>Enter Pin</Text>
                </View>

                <View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: Platform.OS === "ios" ? 20 : 20 }}>
                    <TouchableOpacity disabled={loading} onPress={Updatepin} style={{ height: 50, width: 300, borderRadius: 8, backgroundColor: AppColor.Blue, justifyContent: "center", alignItems: "center" }}>
                        {loading ? (
                            <ActivityIndicator color={"#fff"} size={'small'} />
                        ) : (
                            <Text style={{ fontFamily: "lexendMedium", color: "#fff", fontSize: 18 }}>Complete</Text>
                        )}
                    </TouchableOpacity>
                </View>
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
    otpContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 80
    },
    textInput: {
        width: 300,
        borderColor: 'red',
        borderWidth: 1,
        borderRadius: 5,
        padding: 15,
        position: "absolute",
        opacity: 0
    },
    touchable: {
        width: "59%",
        flexDirection: "row",
        justifyContent: "space-evenly"
    },
    boxes: {
        borderColor: AppColor.Blue,
        padding: 12,
        minWidth: 30,
        borderBottomWidth: 2
    },
    numText: {
        fontFamily: "lexendBold",
        color: AppColor.Blue,
        fontSize: 20
    }
})