import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, Image, View, ScrollView, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather, FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import { AppColor } from '../../utils/Color';
import { date_str_alt } from '../../utils/Validations';

export default function ProofAddressView() {

    const nav = useNavigation();
    const [loading, setLoading] = useState(false);
    const [userAddress, setUserAddress] = useState({})

    async function GetUserAddress() {
        const userToken = await AsyncStorage.getItem('userToken');
        setLoading(true);
        fetch(`${BaseUrl}/user/address`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            }
        }).then(async (res) => {
            const response = await res.json();
            setUserAddress(response.data);
            setLoading(false);
        }).catch((err) => {
            setLoading(false)
            Toast.show({
                type: 'error',
                text1: "Error",
                text2: "An error occured!"
            })
        })
    }

    useEffect(() => {
        GetUserAddress()
    }, []);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        GetUserAddress().then(() => { setRefreshing(false) }).catch(() => setRefreshing(false));
    }, []);

    return (
        <View style={styles.wrapper}>

            {/*Top bar*/}
            <View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                <View style={{ alignItems: "center" }}>
                    <Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>Address</Text>
                </View>
                <View />
            </View>

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={{ margin: 15 }}>
                    {loading ? (
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <ActivityIndicator color={AppColor.Blue} size={'large'} />
                        </View>
                    ) : (
                    <View style={{borderRadius: 8, backgroundColor: "#fff", padding: 20}}>
                        <View style={{ backgroundColor: "#fff", borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <View style={{ height: 40, width: 40, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center" }}>
                                <FontAwesome5 name="flag-checkered" size={20} color="grey" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={{ fontFamily: "lexendBold", color: "grey" }}>{userAddress?.proof_type}</Text>
                                <Text style={{ fontFamily: "lexendMedium", color: "grey" }}>Issued - {date_str_alt(userAddress?.issued_date).date}</Text>
                            </View>

                            {userAddress?.verified ? (
                                <FontAwesome name="check-circle-o" size={24} color={'green'} />
                            ) : (
                                <MaterialIcons name="info-outline" size={24} color="coral" />
                            )}

                        </View>
                        <View style={{paddingTop: 20}}>
                            <DetTab name="Address" value={userAddress?.address} />
                            <DetTab name="Street" value={userAddress?.street} />
                            <DetTab name="City" value={userAddress?.city} />
                            <DetTab name="State" value={userAddress?.state} />
                                    {userAddress?.additional_information && <Text style={{ fontFamily: "lexendMedium", color: "grey", flexWrap: 'wrap', width: 300 }}>P.S: {userAddress?.additional_information}</Text>}
                        </View>
                    
                        {
                            userAddress?.proof ?
                                <View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
                                    <Text style={{ fontFamily: "lexendMedium", marginBottom: 10 }}>Proof</Text>
                                    {
                                        userAddress?.proof.split("/")[4].split(".")[1] !== "PDF" && userAddress?.proof.split("/")[4].split(".")[1] !== "pdf" ?
                                            <Image style={{ height: 300, width: 250 }} resizeMode='contain' source={{ uri: userAddress?.proof }} /> :
                                            <Text style={{ fontFamily: "lexendLight", marginBottom: 10 }}>{userAddress?.proof.split("/")[4]}</Text>
                                    }
                                </View> : ""
                        }
                    </View>
                    )}

                </View>
            </ScrollView>
            
            {
                !userAddress?.verified && !loading ? (
                    <View style={{ position: "absolute", bottom: 0, marginBottom: 20, alignSelf: "center", margin: 15 }}>
                        <TouchableOpacity onPress={() => { nav.navigate('ProofAddressEdit', userAddress) }} style={{ height: 45, backgroundColor: AppColor.Blue, borderRadius: 8, justifyContent: "center", alignItems: "center", width: 300 }}>
                            <Text style={{ fontFamily: 'lexendMedium', color: "#fff" }}>Edit </Text>
                        </TouchableOpacity>
                    </View>
                ) : ""
            }
        </View>
    )
}

function DetTab({name, value}){
    return(
        <View style={styles.detTabs}> 
            <Text style={styles.addrKey}>{name}:</Text> 
            <Text style={styles.addrVal}>{value}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    btn: {
        height: 50,
        backgroundColor: AppColor.Blue,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        width: 300
    },
    addrKey:{
        fontSize: 14,
        fontFamily: "lexendMedium",
    },
    addrVal:{
        fontSize: 14,
        fontFamily: "lexendMedium",
        color: '#aaaaaa',
        flexWrap: 'wrap',
        width: 250,
        paddingLeft: 5
    },
    detTabs:{
        flexDirection: 'row',
        paddingVertical: 5,
    }
})