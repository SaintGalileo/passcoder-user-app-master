import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Entypo, Feather, FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { AppColor } from '../../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../../utils/Url';

export default function Medicals() {
    const nav = useNavigation();

    const [basicLoading, setBasicLoading] = useState(false);
    const [contactLoading, setContactLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);

    async function GetBasic() {
        setBasicLoading(true);
        const userToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/user/medical/details`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            },
            // body: JSON.stringify({
            //     pid: Pid.toUpperCase(),
            //     pin: pidPin
            // })
        }).then(async (res) => {

            const response = await res.json();
            if (response.success === false) {
                setBasicLoading(false);
                nav.navigate("addBasic")
            } else {
                setBasicLoading(false)
                nav.navigate("ViewBasic")
            }
        }).catch((err) => {
            setBasicLoading(false);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error occured - 100"
            })
        })
    }

    async function GetContact() {
        setContactLoading(true);
        const userToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/user/medical/emergency/contacts`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            }
        }).then(async (res) => {
            const response = await res.json();
            if (response.success === false) {
                setContactLoading(false);
                nav.navigate("AddContact");
            } else {
                setContactLoading(false);
                nav.navigate("ViewContact");
            }
        }).catch((err) => {
            setContactLoading(false);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error occured - 101"
            })
        })
    }

    return (
        <View style={styles.wrapper}>

            {/*Top bar*/}
            <View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                <View style={{ alignItems: "center" }}>
                    <Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>Medical History</Text>
                    <Text style={{ fontFamily: "lexendLight" }}>View Medical History</Text>
                </View>
                <View />
            </View>


            <View style={{ margin: 15 }}>
                <TouchableOpacity onPress={GetBasic} disabled={basicLoading} style={{ backgroundColor: "#fff", padding: 20, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }}>
                    <View style={{ padding: 10, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center" }}>
                        <MaterialCommunityIcons name="flag-checkered" size={24} color="grey" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ fontFamily: "lexendBold", color: "#000", fontSize: 16 }}>Basic Details</Text>
                        <Text style={{ color: "#7A7B7C", fontFamily: "lexendLight" }}>Upload height, weight, genotype etc.</Text>
                    </View>
                    {basicLoading ? (
                        <ActivityIndicator size={'small'} color={AppColor.Blue} />
                    ) : (
                        <Entypo name="chevron-right" size={24} color="grey" />
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={GetContact} disabled={contactLoading} style={{ backgroundColor: "#fff", padding: 20, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }}>
                    <View style={{ padding: 10, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center" }}>
                        <MaterialCommunityIcons name="flag-checkered" size={24} color="grey" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ fontFamily: "lexendBold", color: "#000", fontSize: 16 }}>Emergency Contacts</Text>
                        <Text style={{ color: "#7A7B7C", fontFamily: "lexendLight" }}>Create emergency contacts</Text>
                    </View>
                    {contactLoading ? (
                        <ActivityIndicator size={'small'} color={AppColor.Blue} />
                    ) : (
                        <Entypo name="chevron-right" size={24} color="grey" />
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => nav.navigate('WorkHistory')} style={{ backgroundColor: "#fff", padding: 20, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }}>
                    <View style={{ padding: 10, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center" }}>
                        <MaterialCommunityIcons name="flag-checkered" size={24} color="grey" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ fontFamily: "lexendBold", color: "#000", fontSize: 16 }}>History</Text>
                        <Text style={{ color: "#7A7B7C", fontFamily: "lexendLight" }}>View your medical history</Text>
                    </View>
                    <Entypo name="chevron-right" size={24} color="grey" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,

    }
})