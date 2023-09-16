import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Entypo, Feather } from '@expo/vector-icons';
import { AppColor } from '../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';

export default function Docupload() {
    //nav props
    const nav = useNavigation();
    const [bvnLoading, setBvnLoading] = useState(false);
    const [nextofkinLoading, setNextofkinLoading] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);
    const [verfiLoading, setVerifLoading] = useState(false)

    //navigate for bvn
    async function checkBVN() {
        setBvnLoading(true)
        const userToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/user/bvn`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            }
        }).then(async (res) => {
            const response = await res.json();
            if (response.data == null) {
                setBvnLoading(false);
                nav.navigate("AddBvn")
            } else if (response.success === false) {
                setBvnLoading(false)
                Toast.show({
                    type: 'error',
                    text1: "Error",
                    text2: response.message
                })
            } else {
                setBvnLoading(false);
                nav.navigate('BvnView');
            }
        }).catch((err) => {
            Toast.show({
                type: 'error',
                text1: "Error",
                text2: "An error occured!"
            })
        })
    }

    //verify nin button
    async function VerifyNIN() {
        const userToken = await AsyncStorage.getItem('userToken')
        setVerifLoading(true)
        fetch(`${BaseUrl}/user/nin`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            }
        }).then(async (res) => {
            const response = await res.json();
            // if (response.message === "User NIN not found") {
            if (response.data == null) {
                setVerifLoading(false);
                nav.navigate("AddNin")
            } else if (response.success === false) {
                setVerifLoading(false)
                Toast.show({
                    type: 'error',
                    text1: "Error",
                    text2: response.message
                })
            } else {
                setVerifLoading(false);
                nav.navigate('NinView');
            }
        }).catch((err) => {
            setVerifLoading(false)
            Toast.show({
                type: 'error',
                text1: "Error",
                text2: "An error occured!"
            })
        })
    }

    //navigate for next of kin
    async function checkNext() {
        setNextofkinLoading(true);
        const userToken = await AsyncStorage.getItem('userToken');
        fetch(`${BaseUrl}/user/nok`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            }
        }).then(async (res) => {
            const response = await res.json();
            // if (response.message === "User Next Of Kin not found") {
            if (response.data == null) {
                setNextofkinLoading(false);
                nav.navigate("NextofKinAdd")
            } else if (response.success === false) {
                setNextofkinLoading(false)
                Toast.show({
                    type: 'error',
                    text1: "Error",
                    text2: response.message
                })
            } else {
                setNextofkinLoading(false);
                nav.navigate('NextofKinView');
            }
        }).catch((err) => {
            setNextofkinLoading(false);
            Toast.show({
                type: 'error',
                text1: "Error",
                text2: "An error occured!"
            })
        })
    }

    //navigate for address
    async function checkAddress() {
        setAddressLoading(true);
        const userToken = await AsyncStorage.getItem('userToken');
        fetch(`${BaseUrl}/user/address`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }).then(async (res) => {
            const response = await res.json();
            // if (response.message === "User Addresss not found") {
            if (response.data == null) {
                setAddressLoading(false);
                nav.navigate("ProofAddress")
            } else if (response.success === false) {
                setAddressLoading(false)
                Toast.show({
                    type: 'error',
                    text1: "Error",
                    text2: response.message
                })
            } else {
                setAddressLoading(false);
                nav.navigate('ProofAddressView');
            }
        }).catch((err) => {
            setAddressLoading(false);
            Toast.show({
                type: 'error',
                text1: "Error",
                text2: "An error occured!"
            })
        })
    }

    return (
        <View style={styles.wrapper}>
            {/*Top*/}
            <View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                <View>
                    <Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Extended Bio Data</Text>
                    <Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>Choose document you want to upload</Text>
                </View>
                <View>

                </View>
            </View>
            <ScrollView>
                <View style={{ margin: 15, marginTop: 20 }}>


                    <TouchableOpacity onPress={checkAddress} disabled={addressLoading} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, height: 75, marginBottom: 2, borderBottomColor: "grey" }}>
                        <View>
                            <Text style={{ fontFamily: "lexendBold" }}>Proof of address</Text>
                            <Text style={{ fontFamily: "lexendLight", fontSize: 12 }}>Verify Address, Street, City, State</Text>
                        </View>
                        {addressLoading ? (
                            <ActivityIndicator color={AppColor.Blue} size={'small'} />
                        ) : (
                            <Entypo name="chevron-right" size={24} color="#7A7B7C" />
                        )}
                    </TouchableOpacity>


                    <TouchableOpacity disabled={verfiLoading} onPress={VerifyNIN} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, height: 75, marginBottom: 2, borderBottomColor: "grey" }}>
                        <View>
                            <Text style={{ fontFamily: "lexendBold" }}>National Identity Card (NIMC / NIN Slip)</Text>
                            <Text style={{ fontFamily: "lexendLight", fontSize: 12 }}>Upload Virtual NIN for verification</Text>
                            {/* <Text style={{ fontFamily: "lexendLight", fontSize: 12 }}>Upload Virtual NIN and document for verification</Text> */}
                        </View>
                        {verfiLoading ? (
                            <ActivityIndicator color={AppColor.Blue} size={'small'} />
                        ) : (
                            <Entypo name="chevron-right" size={24} color="#7A7B7C" />
                        )}
                    </TouchableOpacity>


                    <TouchableOpacity disabled={bvnLoading} onPress={checkBVN} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, height: 75, marginBottom: 2, borderBottomColor: "grey" }}>
                        <View>
                            <Text style={{ fontFamily: "lexendBold" }}>BVN</Text>
                            <Text style={{ fontFamily: "lexendLight", fontSize: 12 }}>Verify your BVN number</Text>
                        </View>
                        {bvnLoading ? (
                            <ActivityIndicator color={AppColor.Blue} size={'small'} />
                        ) : (
                            <Entypo name="chevron-right" size={24} color="#7A7B7C" />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={checkNext} disabled={nextofkinLoading} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, height: 75, marginBottom: 2, borderBottomColor: "grey" }}>
                        <View>
                            <Text style={{ fontFamily: "lexendBold" }}>Next Of Kin</Text>
                            <Text style={{ fontFamily: "lexendLight", fontSize: 12 }}>Add next of kin details</Text>
                        </View>
                        {nextofkinLoading ? (
                            <ActivityIndicator color={AppColor.Blue} size={'small'} />
                        ) : (
                            <Entypo name="chevron-right" size={24} color="#7A7B7C" />
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1
    },
    house: {
        borderRadius: 8,
        backgroundColor: "#D9D9D9",
        marginTop: 15,
        padding: 10,
        fontFamily: "lexendMedium"
    }
})