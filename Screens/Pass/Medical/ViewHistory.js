import { StyleSheet, Text, View, ActivityIndicator, RefreshControl, ScrollView, Image } from 'react-native';
import React, { useEffect, useState } from 'react'
import { BaseUrl } from '../../../utils/Url';
import { AppColor } from '../../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { timestamp_str_alt } from '../../../utils/Validations';

export default function ViewHistory({ route }) {
    const { id, platform_unique_id } = route.params;
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState({});
    const [errorFetched, setErrorFetched] = useState(null);

    async function GetCurrentHistory() {
        setLoading(true);
        const userToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/user/medical/history`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                unique_id: id, 
                platform_unique_id
            })
        }).then(async (res) => {
            setLoading(false);
            const response = await res.json();
            if (response.success) {
                setFetched(response.data);
            } else {
                setErrorFetched(res.status !== 422 ? response.message : response.data[0].msg);
            }
        }).catch((err) => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error occured - 100"
            })
        })
    }

    useEffect(() => {
        GetCurrentHistory()
    }, [])

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        GetCurrentHistory().then(() => { setRefreshing(false) }).catch(() => setRefreshing(false));
    }, []);

    const nav = useNavigation()

    return (
        <View style={{ flex: 1 }}>
            {/*Top bar*/}
            <View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                <View style={{ alignItems: "center" }}>
                    <Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>Medical History</Text>
                    <Text style={{ fontFamily: "lexendLight" }}>View your medical history</Text>
                </View>
                <View />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size={'large'} color={AppColor.Blue} />
                </View>
            ) : (
                errorFetched ?
                    <View style={{ flex: 1, backgroundColor: "#fff", height: 'auto', marginLeft: 20, marginRight: 20, marginTop: 120, marginBottom: 170, padding: 30, paddingTop: 70, borderRadius: 8 }}>
                        <View style={{ height: 100, width: 100, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                            <FontAwesome5 name="flag-checkered" size={50} color="red" />
                        </View>
                        <View style={{ alignItems: "center", marginTop: 40 }}>
                            <Text style={{ fontFamily: 'lexendBold', fontSize: 17, marginBottom: 10 }}>{errorFetched}</Text>
                        </View>
                    </View> : 
                    <ScrollView
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                            }
                        >
                        <View style={{ backgroundColor: "#fff", height: 'auto', padding: 30, margin: 15, borderRadius: 8 }}>
                            <View style={{ height: 70, width: 70, borderTopLeftRadius: 50, borderTopRightRadius: 50, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, backgroundColor: "#fff", justifyContent: "flex-start", alignItems: "flex-start", alignSelf: "flex-start", marginTop: 10 }}>
                                <Image source={{ uri: fetched?.platform_data?.photo }} style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee" }} />
                                {
                                    fetched?.platform_data?.verified ?
                                        <MaterialIcons name="verified" size={24} color="green" style={{ position: 'absolute', top: -10, right: -15 }} /> :
                                        ""
                                }
                            </View>
                            <View style={{ marginTop: 15 }}>
                                <Text style={{ fontFamily: "lexendBold", color: "#3399ff", fontSize: 17 }}>{fetched?.platform_data?.name}</Text>

                                <View style={{ flexDirection: "row", marginTop: 5, alignItems: "center" }}>
                                    <Ionicons name="md-mail" size={20} color="#3399ff" />
                                    <Text style={{ fontFamily: "lexendMedium", color: "grey", marginLeft: 5 }}>{fetched?.platform_data?.email}</Text>
                                </View>
                                
                                <View style={{ flexDirection: "row", marginTop: 5, alignItems: "center" }}>
                                    <Ionicons name="md-location-outline" size={20} color="#3399ff" />
                                    <Text style={{ fontFamily: "lexendMedium", color: "grey", marginLeft: 5 }}>{fetched?.data?.location}</Text>
                                </View>

                                <View>
                                    <View style={{ flexDirection: "row", marginTop: 5, alignItems: "center" }}>
                                        <MaterialIcons name="date-range" size={20} color="#3399ff" />
                                        <Text style={{ fontFamily: "lexendLight", color: "grey", marginLeft: 5 }}><Text style={{ fontFamily: "lexendBold" }}>Admitted:</Text>{" "}{timestamp_str_alt(fetched?.data?.date_admitted).fulldate}</Text>
                                    </View>
                                    <View style={{ flexDirection: "row", marginTop: 5, alignItems: "center" }}>
                                        <MaterialIcons name="date-range" size={20} color="#3399ff" />
                                        <Text style={{ fontFamily: "lexendLight", color: "grey", marginLeft: 5 }}><Text style={{ fontFamily: "lexendBold" }}>Released:</Text>{" "}{timestamp_str_alt(fetched?.data?.date_released).fulldate}</Text>
                                    </View>
                                    <Text style={{ fontFamily: "lexendLight", color: "grey", marginLeft: 25, top: 10 }}><Text style={{ fontFamily: "lexendBold" }}>Hospital:</Text>{" "}{fetched?.data?.hospital}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ backgroundColor: "#fff", height: 'auto', paddingLeft: 30, paddingRight: 30, paddingTop: 20, paddingBottom: 30, margin: 15, borderRadius: 8 }}>
                            <Text style={{ fontFamily: "lexendMedium", top: 10, fontSize: 15, textDecorationLine: 'underline' }}>Admission Details</Text>
                            <Text style={{ fontFamily: "lexendLight", marginTop: 30 }}>{fetched?.data?.admission_details}</Text>
                        </View>
                    </ScrollView>
            )}
        </View>
    )
}

const styles = StyleSheet.create({})