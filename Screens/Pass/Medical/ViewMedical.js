import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Entypo, Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { BaseUrl } from '../../../utils/Url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColor } from '../../../utils/Color';

export default function ViewMedical() {
    const nav = useNavigation();
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false);
    const [detail, setDetails] = useState({});

    async function GetUserDetails() {
        const userToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/user/medical/details`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            }
        }).then(async (res) => {
            const response = await res.json();
            setDetails(response);
            setLoading(false);
        }).catch((err) => {
            setLoading(false);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error occured - 100"
            })
        })
    }

    useEffect(() => {
        GetUserDetails()
    }, [])

    return (
        <View style={{ flex: 1 }}>

            {/*Top bar*/}
            <View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                <View style={{ alignItems: "center" }}>
                    <Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>Basic Details</Text>
                    <Text style={{ fontFamily: "lexendLight" }}>Medical basic details</Text>
                </View>
                <View />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator color={AppColor.Blue} size={'large'} />
                </View>
            ) : (
                <>
                    <ScrollView  refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={GetUserDetails} />
                    }>
                        <View style={{ margin: 15 }}>
                            <TouchableOpacity style={styles.optionStyle}>
                                <MaterialCommunityIcons name="flag-checkered" size={24} color={"#3399ff"} />
                                <Text style={{ fontFamily: "lexendBold", fontSize: 18, color: "grey", flex: 1, marginLeft: 10 }}>Height</Text>
                                <Text style={{ fontFamily: "lexendBold", fontSize: 22, color: "#3399ff" }}>{detail?.data?.height} cm</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.optionStyle}>
                                <MaterialCommunityIcons name="flag-checkered" size={24} color={"#33cc33"} />
                                <Text style={{ fontFamily: "lexendBold", fontSize: 18, color: "grey", flex: 1, marginLeft: 10 }}>Weight</Text>
                                <Text style={{ fontFamily: "lexendBold", fontSize: 22, color: "#33cc33" }}>{detail?.data?.weight} kg</Text>
                            </TouchableOpacity>


                            <TouchableOpacity style={styles.optionStyle}>
                                <MaterialCommunityIcons name="flag-checkered" size={24} color={"#E52D1E"} />
                                <Text style={{ fontFamily: "lexendBold", fontSize: 18, color: "grey", flex: 1, marginLeft: 10 }}>Blood Group</Text>
                                <Text style={{ fontFamily: "lexendBold", fontSize: 22, color: "#E52D1E" }}>{detail?.data?.blood_group}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.optionStyle}>
                                <MaterialCommunityIcons name="flag-checkered" size={24} color={"violet"} />
                                <Text style={{ fontFamily: "lexendBold", fontSize: 18, color: "grey", flex: 1, marginLeft: 10 }}>Genotype</Text>
                                <Text style={{ fontFamily: "lexendBold", fontSize: 22, color: "violet" }}>{detail?.data?.genotype}</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                    <View style={{ position: "absolute", bottom: 0, marginBottom: 20, alignSelf: "center" }}>
                        <TouchableOpacity
                            onPress={() => {
                                nav.navigate('EditBasic', { height1: detail?.data?.height, weight1: detail?.data?.weight, gen: detail?.data?.genotype, blood1: detail?.data?.blood_group,unique:detail?.data?.unique_id })
                            }}
                            style={{ backgroundColor: AppColor.Blue, height: 50, justifyContent: "center", alignItems: "center", borderRadius: 8, width: 300 }}>
                            <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}



        </View>
    )
}

const styles = StyleSheet.create({
    optionStyle: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        marginBottom: 20,
        padding: 20,
        borderRadius: 8
    }
})