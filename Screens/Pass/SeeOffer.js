import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { timestamp_str_alt } from '../../utils/Validations';

export default function SeeOffer({ route }) {
    const { item } = route.params;
    const nav = useNavigation()
    return (
        <View style={styles.wrapper}>
            <Ionicons name="close-circle-outline" size={35} color="red" onPress={() => nav.goBack()} style={{ marginTop: 50, alignSelf: "center" }} />
            <View style={{ marginTop: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ backgroundColor: "#2a52be", padding: 30, borderTopEndRadius: 50 }}>
                    <Text style={{ fontFamily: "lexendBold", color: "#fff", fontSize: 20 }}>{item?.discount}%</Text>
                </View>
                <Image source={{ uri: item?.partner_data?.photo || "http://fls.passcoder.io/partner.png" }} style={{ height: 80, width: 80, borderRadius: 100, backgroundColor: "#eee", marginLeft: -20 }} />
                <View />
            </View>

            <View style={{ margin: 15 }}>
                <View style={{ flexDirection: "row", justifyContent: 'space-between', alignItems: "center" }}>
                    <Text style={{ fontFamily: "lexendBold", fontSize: 20, flexWrap: 'wrap', width: 300 }}>{item?.name}</Text>
                    {item?.partner_data?.verified ? (
                        <MaterialIcons name="verified" size={30} color="green" />
                    ) : ""}
                </View>

                <Text style={{ fontFamily: "lexendBold", fontSize: 15, paddingTop: 10 }}>{item?.partner_data?.name}</Text>
                <Text style={{ color: "grey", fontFamily: "lexendLight" }}>{item?.partner_data?.city}</Text>
                <Text style={{ color: "grey", fontFamily: "lexendLight", paddingBottom: 20 }}>{item?.partner_data?.state}, {item?.partner_data?.country}</Text>
                {
                    item?.start !== null && item?.end !== null ?
                        <>
                            <Text style={{ fontFamily: "lexendMedium", fontSize: 15, color: "red" }}>Valid through:</Text>
                            <Text style={{ fontFamily: "lexendLight", fontSize: 13, color: "grey" }}>{timestamp_str_alt(item?.start).fulldate} - {timestamp_str_alt(item?.end).fulldate}</Text>
                        </> : (
                            item?.start !== null && item?.end === null ?
                                <>
                                    <Text style={{ fontFamily: "lexendMedium", fontSize: 15, color: "green" }}>Starts</Text>
                                    <Text style={{ fontFamily: "lexendLight", fontSize: 13, color: "grey" }}>{timestamp_str_alt(item?.start).fulldate}</Text>
                                </> : (
                                    item?.end !== null && item?.start === null ?
                                        <>
                                            <Text style={{ fontFamily: "lexendMedium", fontSize: 15, color: "red" }}>Ends</Text>
                                            <Text style={{ fontFamily: "lexendLight", fontSize: 13, color: "grey" }}>{timestamp_str_alt(item?.end).fulldate}</Text>
                                        </> :
                                        <Text style={{ fontFamily: "lexendMedium", fontSize: 15, color: "green" }}>Ongoing</Text>
                                )
                        )
                }
                <Text style={{ color: "grey", fontFamily: "lexendMedium", marginTop: 10 }}>Multiple use - {item?.single ? "Not available" : "Available"}</Text>
                <Text style={{ color: "grey", fontFamily: "lexendMedium", marginTop: 10 }}>Criteria - Minimum of {item?.points + " points"} or {item?.star + " stars"}</Text>
            </View>

            <View style={{ borderWidth: 2, borderColor: "#eee" }} />

            <View style={{ margin: 15 }}>
                {
                    item?.description ? 
                        <Text style={{ fontFamily: "lexendLight" }}>{item?.description}</Text> : 
                        <>
                            <MaterialIcons style={{ textAlign: "center", top: 100 }} name="hourglass-empty" size={70} color="grey" />
                            <Text style={{ fontFamily: "lexendBold", textAlign: "center", fontSize: 15, top: 100 }}>No details</Text>    
                        </>

                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff"
    }
})