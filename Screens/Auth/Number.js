import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons'
import { AppColor } from '../../utils/Color'
import { useNavigation } from '@react-navigation/native'

export default function Number() {

    //nav props
    const nav = useNavigation();

    return (
        <View style={styles.wrapper}>

            {/*Top bar*/}
            <View style={styles.topBar}>
                <Entypo name="chevron-left" size={24} color={AppColor.Blue} />
                <FontAwesome name="question" size={24} color={AppColor.Blue} />
            </View>

            {/*Description text*/}
            <View style={styles.descText}>
                <Text style={styles.bigText}>What's your Number</Text>
                <Text style={styles.smallText}>We’ll send you a verification code so make sureit’s your number</Text>
            </View>

            {/*Phone input*/}
            <View style={styles.mainView}>
                <View style={{ flexDirection: "row", height: 50, backgroundColor: AppColor.LightGrey, justifyContent: "space-between", borderRadius: 12 }}>
                    <TextInput
                        style={[styles.textInput,{flex:1}]}
                        placeholder='Phone Number' />

                    <TouchableOpacity activeOpacity={0.8} style={styles.flagWrapper}>
                        <Ionicons name="chevron-down" size={24} color="black" />
                        <Image source={require("../../assets/img/ngflag.png")} />
                    </TouchableOpacity>
                </View>


                {/*Next Button*/}
                <TouchableOpacity style={styles.nextButton} onPress={() => {
                    nav.navigate("Otp")
                }}>
                    <Text style={styles.nextText}>Next</Text>
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
        marginTop: 47
    },
    nextText: {
        fontFamily: "lexendMedium",
        color: AppColor.White
    }
})