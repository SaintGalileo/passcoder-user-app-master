import { ActivityIndicator, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign, Entypo } from '@expo/vector-icons'
import { AppColor } from '../../utils/Color'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export default function Transfer({ route }) {

    const { sendOption, passUser } = route.params

    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [nextLoading, setNextLoading] = useState(false)
    const [recipientPartnerDetails, setRecipientPartnerDetails] = useState({});


    const [business, setBusiness] = useState([]);

    const handleSearch = (text) => {
        setSearch(text);
        // Filter the data based on the search query
        const filteredData = business.filter((item) =>
            item.name.toLowerCase().includes(text.toLowerCase())
        );
        setBusiness(filteredData);
    };

    //function to get current user from back end
    async function GetBusiness() {
        const userToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/public/all/partners`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            }
        }).then(async (res) => {
            const response = await res.json();
            setBusiness(response.data.rows);
            setLoading(false)
        }).catch((err) => {
            setLoading(false);
        })
    }
    const nav = useNavigation();



    async function MoveToNextScreen(pid) {
        setNextLoading(true)
        const userToken = await AsyncStorage.getItem('userToken');
        fetch(`${BaseUrl}/public/find/partner`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pid: pid,
            })
        }).then(async (res) => {
            const response = await res.json();
            if (response.success) {
                setRecipientPartnerDetails(response.data);
                nav.navigate("PasscoderPartnerSendDetails", {
                    sendOption: sendOption,
                    sendPaymentPID: pid,
                    passUser: passUser,
                    recipientPartnerDetails: response.data
                });
            } else {
                setNextLoading(false)
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: res.status !== 422 ? response.message : response.data[0].msg
                });
            }
        }).catch((err) => {
            setNextLoading(false);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "An error occured!"
            });
        })
    }

    //render all the busiess to user
    const RenderBusiness = ({ item }) => {
        if (!search) {
            null
        } else {
            return (
                <TouchableOpacity
                    onPress={() => MoveToNextScreen(item?.pid)}
                    style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <View>
                        <Image
                            style={{ height: 60, width: 60, borderRadius: 100 }}
                            source={{ uri: item?.photo }}
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ fontFamily: 'lexendMedium' }}>{item?.name}</Text>
                        <Text style={{ fontFamily: 'lexendLight', color: "grey" }}>{item?.city}</Text>
                    </View>
                    <Entypo name="chevron-right" size={24} color="grey" />
                </TouchableOpacity>
            )
        }
    }


    useEffect(() => {
        GetBusiness()
    }, [])


    const RenderNextLoading = () => {
        return (
            <Modal visible={nextLoading} animationType='fade' transparent>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator color={AppColor.Blue} size={'large'} />
                </View>
            </Modal>
        )
    }
    return (
        <>
            <RenderNextLoading />
            <View style={styles.wrapper}>
                <View style={{ margin: 15, marginTop: 50, flexDirection: "row", alignItems: "center" }}>
                    <AntDesign name="arrowleft" size={24} color={AppColor.Blue} />
                    <Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, fontSize: 20, marginLeft: 10 }} onPress={()=>nav.goBack()}>Transfer to Business</Text>
                </View>

                <View style={{ margin: 15 }}>
                    <TextInput
                        onChangeText={handleSearch}
                        placeholder='Search Business'
                        style={styles.searchBar}
                    />
                </View>


                {loading ? (
                    <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
                        <ActivityIndicator color={AppColor.Blue} size={'large'} />
                    </View>
                ) : (
                    <FlatList
                        data={business}
                        initialNumToRender={10}
                        contentContainerStyle={{ margin: 15 }}
                        renderItem={RenderBusiness}
                        ListEmptyComponent={()=>{
                            return(
                                <View style={{alignItems:"center",marginTop:10}}>
                                    <Text style={{fontFamily:"lexendBold",fontSize:18}}>Your Search</Text>
                                    <Text style={{fontFamily:"lexendLight",color:"grey"}}>"{search}"</Text>
                                </View>
                            )
                        }}
                    />
                )}
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff"
    },
    searchBar: {
        height: 45,
        paddingLeft: 20,
        fontFamily: "lexendMedium",
        backgroundColor: "#eee",
        borderRadius: 10
    }
})