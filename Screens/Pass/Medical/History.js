import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import { BaseUrl } from '../../../utils/Url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColor } from '../../../utils/Color';
import { timestamp_str_alt } from '../../../utils/Validations';

export default function History() {

    const [loading, setLoading] = useState(false);
    const nav = useNavigation();

    const [fetchedHist, setFetchedHist] = useState([]);

    const [errorHistory, setErrorHistory] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    async function GetUserHistory() {
        setLoading(true);
        const userToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/user/medical/history/all`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }).then(async (res) => {
            const response = await res.json()

            if (response.data) setFetchedHist(response.data)
            else setErrorHistory(response.message)
            setLoading(false);
        })
    }

    useEffect(() => {
        GetUserHistory();
    }, [])

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        GetUserHistory().then(() => {
            setRefreshing(false)
        })
    }, []);

    //render item
    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => nav.navigate('ViewHistory', { id: item.unique_id, platform_unique_id: item.platform_unique_id })}
            style={{ backgroundColor: "#fff", height: 'auto', padding: 15, marginBottom: 15, borderRadius: 8 }}>
            <View>
                <Text style={{ fontFamily: "lexendBold", color: "#3399ff", fontSize: 17 }}>{item?.hospital}</Text>

                <View style={{ flexDirection: "row", marginTop: 5, alignItems: "center" }}>
                    <Ionicons name="md-location-outline" size={20} color="#3399ff" />
                    <Text style={{ fontFamily: "lexendMedium", color: "grey", marginLeft: 5 }}>{item?.location}</Text>
                </View>

                <View>
                    <View style={{ flexDirection: "row", marginTop: 5, alignItems: "center" }}>
                        <MaterialIcons name="date-range" size={20} color="#3399ff" />
                        <Text style={{ fontFamily: "lexendLight", color: "grey", marginLeft: 5 }}><Text style={{ fontFamily: "lexendBold" }}>Date admitted:</Text>{" "}{timestamp_str_alt(item?.date_admitted).fulldate}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )

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
                errorHistory ? 
                    <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
                        <Text style={{ fontFamily: "lexendBold" }}>{errorHistory}</Text>
                    </View> :
                    <View style={{ margin: 15 }}>
                        <FlatList
                            refreshing={refreshing}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                            }
                            contentContainerStyle={{ paddingBottom: 200 }}
                            showsVerticalScrollIndicator={false}
                            data={fetchedHist}
                            keyExtractor={item => `${item.unique_id}`}
                            renderItem={renderItem}
                        />
                    </View>
            )}

        </View>
    )
}

const styles = StyleSheet.create({})