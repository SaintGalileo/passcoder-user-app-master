import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native'
import React, { useState } from 'react'
import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons'
import { AppColor } from '../../utils/Color'
import { useNavigation } from '@react-navigation/native'

export default function Emailcheck() {

    //nav props
    const nav = useNavigation();

    return (
        <View style={styles.wrapper}>
            {/*Top bar*/}
			<View style={styles.topBar}>
				{/* <Entypo name="chevron-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} /> */}
				{/* <FontAwesome name="question" size={24} color={AppColor.Blue} /> */}
			</View>

            {/*Description text*/}
            <View style={styles.descText}>
                <Text style={styles.bigText}>Check your email</Text>
                <Text style={styles.smallText}>Verification email has been sent to your mailbox.</Text>
            </View>

            {/*password input*/}
            <View style={styles.mainView}>

                <Image source={require("../../assets/img/mail.png")} resizeMode='contain' style={{alignSelf:"center",height:200,width:200}}/>

                {/*Next Button*/}
                <TouchableOpacity style={styles.nextButton} onPress={()=>nav.replace("Login")}>
                    <Text style={{color:"#fff",fontFamily:"lexendBold"}}>Login</Text>
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
        marginTop: 50
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
    nextButton: {
        height: 50,
        backgroundColor: AppColor.Blue,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        marginTop: 47
    },


})