import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { AppColor } from '../../utils/Color'
import { Entypo, Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

export default function Pin() {
    //nav props
    const nav = useNavigation();

    //our states
    const [otpCode, setOTPCode] = useState("");
    const [isPinReady, setIsPinReady] = useState(false);
    const maximumCodeLength = 4;

    const boxArray = new Array(maximumCodeLength).fill(0);

    //our ref
    const inputRef = useRef();

    //onblur
    const handleOnBlur = () => { };

    const boxDigit = (_, index) => {
        const emptyInput = "";
        const digit = otpCode[index] || emptyInput;
        return (
            <View style={styles.boxes} key={index}>
                <Text style={{ fontFamily: "lexendBold", color: AppColor.White, textAlign: "center", fontSize: 18 }}>{digit}</Text>
            </View>
        );
    };
    return (
        <View style={styles.wrapper}>
            {/*Top bar*/}
            <View style={styles.topBar}>
                <Entypo name="chevron-left" size={24} color={AppColor.White} onPress={()=>nav.goBack()}/>
                <Text style={{ color: AppColor.White, fontFamily: "lexendBold", fontSize: 17 }}>Create your four digits pin</Text>
                <Feather name="info" size={24} color={AppColor.White} />
            </View>

            {/*Four digit pin*/}
            <View style={styles.otpContainer}>
                <TouchableOpacity style={styles.touchable}>
                    {boxArray.map(boxDigit)}
                </TouchableOpacity>
                <TextInput
                    onSubmitEditing={() => {
                        nav.navigate("Photo")
                    }}
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

            <View style={{ justifyContent: "center", alignSelf: "center", marginTop: 70, flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 10, borderRadius: 100, opacity: 0.5 }}>
                <Image source={require("../../assets/img/bulb.png")} />
                <Text style={{ color: AppColor.White, fontFamily: "lexendMedium" }}>Enter Pin to complete login</Text>
            </View>

            <TouchableOpacity style={{ alignSelf: "center", position: "absolute", bottom: 50 }}>
                <Text style={{ color: AppColor.White, fontFamily: "lexendBold" }}>Forgot Passcoder Pin?</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: AppColor.Blue
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
        borderColor: '#e5e5e5',
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
        borderColor: '#e5e5e5',
        padding: 12,
        minWidth: 30,
        borderBottomWidth: 2
    },
    numText: {
        fontFamily: "lexendBold",
        color: AppColor.White,
        fontSize: 20
    }
})