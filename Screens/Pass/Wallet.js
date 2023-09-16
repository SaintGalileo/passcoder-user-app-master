import { ActivityIndicator, Dimensions, StyleSheet, RefreshControl, ScrollView, Text, TouchableOpacity, View, Image, TextInput, FlatList, Alert } from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppColor } from '../../utils/Color';
import { Entypo, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { Paystack, paystackProps } from 'react-native-paystack-webview';
import { count_filter, digit_filter, payment_methods, internal_character_key, passcoder_icon, random_numbers, send_payment_options } from '../../utils/Validations';
import Toast from 'react-native-toast-message';
import { BaseUrl } from '../../utils/Url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from "react-native-modal";

export default function Wallet() {

    const nav = useNavigation();

    const [activeChoice, setUserChoice] = useState("Transactions");

    const UserChoice = [
        {
            title: "Transactions"
        },
        {
            title: "Requests"
        },
        {
            title: "History"
        }
    ];

    const [transactionHistory, setTransactionHistory] = useState([]);
    const [transactionHistoryLoading, setTransactionHistoryLoading] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [pendingRequestsLoading, setPendingRequestsLoading] = useState(false);
    const [allRequests, setAllRequests] = useState([]);
    const [allRequestsLoading, setAllRequestsLoading] = useState(false);

    const [acceptLoading, setAcceptLoading] = useState(false);
    const [declineLoading, setDeclineLoading] = useState(false);

    const [requestPaymentSuccessMessage, setRequestPaymentSuccessMessage] = useState(null);
    const [requestPaymentErrorMessage, setRequestPaymentErrorMessage] = useState(null);

    const [passUser, setPassuser] = useState({});
    const [loading, setLoading] = useState(false);

    async function getCurrentUser() {
        setFundMethod(null);
        setLoading(true);
        const userToken = await AsyncStorage.getItem('userToken');
        fetch(`${BaseUrl}/user/profile`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }).then(async (res) => {
            const response = await res.json();
            if (res.status !== 200) {
                setLoading(false);
                await AsyncStorage.removeItem('userToken');
                Toast.show({
                    type: "error",
                    text1: "Access",
                    text2: response.message
                });
                nav.replace('Authentication');
            } else {
                setPassuser({ ...response.data, balance: digit_filter(response.data.balance), balance_main: parseInt(response.data.balance), points: count_filter(response.data.points) });
                if (passUser) setLoading(false);
            }
        }).catch((err) => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error occured - 100"
            })
        })
    };

    async function GetPendingPaymentRequests() {
        setPendingRequests([]);
        setPendingRequestsLoading(true);
        const passToken = await AsyncStorage.getItem('userToken');
        fetch(`${BaseUrl}/user/pending/payment/requests`, {
            method: "POST",
            headers: {
                'passcoder-access-token': passToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(async (res) => {
            const response = await res.json();
            if (response.data !== null) {
                setPendingRequests(response.data !== null ? response.data.rows.sort((a, b) => new Date(a.updatedAt.date + " " + a.updatedAt.time).getTime() < new Date(b.updatedAt.date + " " + b.updatedAt.time).getTime() ? 1 : -1) : []);
                setPendingRequestsLoading(false);
            } else {
                setPendingRequestsLoading(false);
            }
        })
    };

    async function GetPaymentRequests() {
        setAllRequests([]);
        setAllRequestsLoading(true);
        const passToken = await AsyncStorage.getItem('userToken');
        fetch(`${BaseUrl}/user/payment/requests?size=50`, {
            method: "POST",
            headers: {
                'passcoder-access-token': passToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(async (res) => {
            const response = await res.json();
            if (response.data !== null) {
                setAllRequests(response.data !== null ? response.data.rows.sort((a, b) => new Date(a.updatedAt.date + " " + a.updatedAt.time).getTime() < new Date(b.updatedAt.date + " " + b.updatedAt.time).getTime() ? 1 : -1) : []);
                setAllRequestsLoading(false);
            } else {
                setAllRequestsLoading(false);
            }
        }).catch((err) => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error occured - 102"
            })
        })
    };

    async function GetTransactionHistory() {
        setTransactionHistory([]);
        setTransactionHistoryLoading(true);
        const passToken = await AsyncStorage.getItem('userToken');
        fetch(`${BaseUrl}/user/transactions?size=50`, {
            method: "POST",
            headers: {
                'passcoder-access-token': passToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(async (res) => {
            const response = await res.json();

            if (response.data !== null) {
                // setTransactionHistory(response.data !== null ? response.data.rows.sort((a, b) => new Date(a.updatedAt.date + " " + a.updatedAt.time).getTime() < new Date(b.updatedAt.date + " " + b.updatedAt.time).getTime() ? 1 : -1) : []);
                setTransactionHistory(response.data !== null ? response.data.rows : []);
                setTransactionHistoryLoading(false);
            } else {
                setTransactionHistoryLoading(false);
            }
        }).catch((err) => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error occured - 103"
            })
        })
    };

    async function Accept(id) {
        setAcceptLoading(true);
        const passToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/user/accept/request`, {
            method: "POST",
            headers: {
                'passcoder-access-token': passToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                unique_id: id
            })
        }).then(async (res) => {
            const response = await res.json();
            if (response.success === true) {
                setAcceptLoading(false);
                GetPendingPaymentRequests();
                getCurrentUser();
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Payment Accepted"
                })
            } else {
                setAcceptLoading(false);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: res.status !== 422 ? response.message : response.data[0].msg
                })
            }
        }).catch((err) => {
            setAcceptLoading(false);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "An error occured!!"
            });
        })
    }

    async function Decline(id) {
        setDeclineLoading(false);
        const passToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/user/decline/request`, {
            method: "POST",
            headers: {
                'passcoder-access-token': passToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                unique_id: id
            })
        }).then(async (res) => {
            const response = await res.json();
            if (response.success === true) {
                setDeclineLoading(false);
                GetPendingPaymentRequests();
                getCurrentUser();
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Payment Declined!"
                })
            } else {
                setDeclineLoading(false);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: res.status !== 422 ? response.message : response.data[0].msg
                })
            }
        }).catch((err) => {
            setDeclineLoading(false);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "An error occured!!"
            });
        })
    }

    useEffect(() => {
        getCurrentUser();
        GetPendingPaymentRequests();
        GetPaymentRequests();
        GetTransactionHistory();
    }, []);
    
    const switchTab = (title) => {
        if (title === "Transactions") {
            GetTransactionHistory();
        } else if (title === "History") {
            GetPaymentRequests();
        } else {
            GetPendingPaymentRequests();
        }
    };

    const [refreshingTransactionHistory, setRefreshingTransactionHistory] = useState(false);
    const [refreshingPaymentRequests, setRefreshingPaymentRequests] = useState(false);
    const [refreshingPendingPaymentRequests, setRefreshingPendingPaymentRequests] = useState(false);

    const onRefreshTransactionHistory = React.useCallback(() => {
        setRefreshingTransactionHistory(true);
        GetTransactionHistory().then(() => { setRefreshingTransactionHistory(false) }).catch(() => setRefreshingTransactionHistory(false));
    }, []);

    const onRefreshPaymentRequests = React.useCallback(() => {
        setRefreshingPaymentRequests(true);
        GetPaymentRequests().then(() => setRefreshingPaymentRequests(false)).catch(() => setRefreshingPaymentRequests(false));
    }, []);

    const onRefreshPendingPaymentRequests = React.useCallback(() => {
        setRefreshingPendingPaymentRequests(true);
        GetPendingPaymentRequests().then(() => setRefreshingPendingPaymentRequests(false)).catch(() => setRefreshingPendingPaymentRequests(false));
    }, []);

    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentWithdrawalLoading, setPaymentWithdrawalLoading] = useState(false);
    const [paymentWithdrawalSuccessMessage, setPaymentWithdrawalSuccessMessage] = useState(null);
    const [paymentWithdrawalErrorMessage, setPaymentWithdrawalErrorMessage] = useState(null);
    
    const [sendPaymentLoading, setSendPaymentLoading] = useState(false);
    const [sendPaymentSuccessMessage, setSendPaymentSuccessMessage] = useState(null);
    const [sendPaymentErrorMessage, setSendPaymentErrorMessage] = useState(null);

    const general_min_amount = 1000;
    const credit_card_max_amount = 20000;
    const transfer_max_amount = 100000;

    const fundAmountRef = useRef(null);
    const fundMethodRef = useRef(null);
    
    const fundWithdrawAmountRef = useRef(null);
    const walletPinRef = useRef(null);
    
    const [fundAmount, setFundAmount] = useState(null);
    const [fundMethod, setFundMethod] = useState(null);
    
    const [fundWithdrawAmount, setFundWithdrawAmount] = useState(null);
    const [fundWithdrawMethod, setFundWithdrawMethod] = useState("Transfer");
    const [walletPin, setWalletPin] = useState(null);

    const sendPaymentPIDRef = useRef(null);
    const sendPaymentAmountRef = useRef(null);
    
    const [sendOption, setSendOption] = useState(null);
    const [sendPaymentPID, setSendPaymentPID] = useState(null);
    const [sendPaymentAmount, setSendPaymentAmount] = useState(null);
    
    const [paystackConfig, setPaystackConfig] = useState(null);
    const paystackWebViewRef = useRef(paystackProps.PayStackRef);

    const [cardDepositStatusModal, setCardDepositStatusModal] = useState(false);
    const [cardDepositLoading, setCardDepositLoading] = useState(false);
    const [cardDepositSuccessMessage, setCardDepositSuccessMessage] = useState(null);
    const [cardDepositErrorMessage, setCardDepositErrorMessage] = useState(null);
    
    const [companyBankDetails, setCompanyBankDetails] = useState({});
    const [chargePrice, setChargePrice] = useState(null);
    const [transactionUniqueID, setTransactionUniqueID] = useState(null);
    
    const [requestUniqueID, setRequestUniqueID] = useState(null);
    const [requestPaymentAmount, setRequestPaymentAmount] = useState(null);

    const handleFundAmountSubmit = useCallback((ev) => {
        if (ev.nativeEvent.text.length !== 0) {
            setFundAmount(parseInt(ev.nativeEvent.text));
            if (parseInt(ev.nativeEvent.text) < general_min_amount) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Minimum amount is 1,000 Naira"
                });
            } else {
                setEnterAmountModal(false);
                setConfirmPaymentModal(true);
            }
        }
    }, []);
    
    const handleCardPaymentSubmit = useCallback((ev, passUser) => {
        setFundMethod(payment_methods.card);
        setChooseFundMethodModal(false);
        nav.navigate("FundAmount", {
            fundMethod: payment_methods.card,
            passUser: passUser
        });
    }, []);
    
    const handleTransferPaymentSubmit = useCallback((ev, passUser) => {
        setFundMethod(payment_methods.transfer);
        setChooseFundMethodModal(false);
        nav.navigate("FundAmount", {
            fundMethod: payment_methods.transfer,
            passUser: passUser
        });
    }, []);

    const handleWithdrawFundAmountSubmit = useCallback((ev, passUser) => {
        if (ev.nativeEvent.text.length !== 0 && parseInt(ev.nativeEvent.text) >= general_min_amount) {
            setFundWithdrawAmount(parseInt(ev.nativeEvent.text));
            if (parseInt(ev.nativeEvent.text) < general_min_amount) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Minimum amount is 1,000 Naira"
                });
            } else if (parseInt(ev.nativeEvent.text) > passUser.balance_main) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: `Maximum amount is ${passUser.balance} Naira`
                });
            } else {
                setEnterWithdrawAmountModal(false);
                setConfirmWithdrawPaymentModal(true);
            }
        }
    }, []);

    const handleSendUserOptionSubmit = useCallback((ev, passUser) => {
        setSendOption(send_payment_options.passcoder_user);
        setChooseSendOptionModal(false);
        nav.navigate("PasscoderUserSend", {
            sendOption: send_payment_options.passcoder_user,
            passUser: passUser
        });
    }, []);

    const handleSendPartnerOptionSubmit = useCallback((ev, passUser) => {
        setSendOption(send_payment_options.passcoder_partner);
        setChooseSendOptionModal(false);
        nav.navigate("PasscoderBusinessSend", {
            sendOption: send_payment_options.passcoder_partner,
            passUser: passUser
        });
    }, []);

    const handleSendBankTransferOptionSubmit = useCallback((ev, passUser) => {
        setSendOption(send_payment_options.bank_transfer);
        setChooseSendOptionModal(false);
        nav.navigate("BankTransferSend", {
            sendOption: send_payment_options.bank_transfer,
            passUser: passUser
        });
    }, []);

    const handleSendPaymentPIDSubmit = useCallback((ev) => {
        if (ev.nativeEvent.text.length === 6) {
            setSendPaymentPID(ev.nativeEvent.text);
            setSendPaymentPIDModal(false);
            setSendPaymentAmountModal(true);
        }
    }, []);

    const handleSendPaymentAmountSubmit = useCallback((ev, passUser) => {
        if (ev.nativeEvent.text.length !== 0 && parseInt(ev.nativeEvent.text) >= 50) {
            setSendPaymentAmount(parseInt(ev.nativeEvent.text));
            if (parseInt(ev.nativeEvent.text) < 50) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Minimum amount is 50 Naira"
                });
            } else if (parseInt(ev.nativeEvent.text) > passUser.balance_main) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: `Maximum amount is ${passUser.balance} Naira`
                });
            } else {
                setSendPaymentAmountModal(false);
                setSendPaymentWalletPinModal(true);
            }
        }
    }, []);

    const handleSendPaymentWalletPinSubmit = useCallback((ev, amount, pid) => {
        setWalletPin(ev.nativeEvent.text);
        setSendPaymentWalletPinModal(false);
        setSendPaymentLoading(true);
        setSendPaymentStatusModal(true);

        sendPayment(ev.nativeEvent.text, pid, amount);

    }, []);

    const handleWalletPinSubmit = useCallback((ev, amount) => {
        setWalletPin(ev.nativeEvent.text);
        setEnterWalletPinModal(false);
        setPaymentWithdrawalLoading(true);
        setWithdrawalPaymentStatusModal(true);

        authorizeWithdrawal(ev.nativeEvent.text, amount);
        
    }, []);

    const handleWalletPinPaymentSubmit = useCallback((ev, unique_id, pid) => {
        setWalletPin(ev.nativeEvent.text);
        setAuthorizePaymentModal(false);
        setAcceptLoading(true);
        setRequestPaymentStatusModal(true);

        authorizePayment(ev.nativeEvent.text, unique_id, pid);

    }, []);
    
    const [chooseFundMethodModal, setChooseFundMethodModal] = useState(false);
    const [enterAmountModal, setEnterAmountModal] = useState(false);
    const [confirmPaymentModal, setConfirmPaymentModal] = useState(false);
    const [bankAccountAndChargeModal, setBankAccountAndChargeModal] = useState(false);
    const [bankAccountModal, setBankAccountModal] = useState(false);
    
    const [enterWithdrawAmountModal, setEnterWithdrawAmountModal] = useState(false);
    const [confirmWithdrawPaymentModal, setConfirmWithdrawPaymentModal] = useState(false);
    const [enterWalletPinModal, setEnterWalletPinModal] = useState(false);
    const [withdrawalPaymentStatusModal, setWithdrawalPaymentStatusModal] = useState(false);
    
    const [authorizePaymentModal, setAuthorizePaymentModal] = useState(false);
    const [requestPaymentStatusModal, setRequestPaymentStatusModal] = useState(false);
    
    const [chooseSendOptionModal, setChooseSendOptionModal] = useState(false);
    const [sendPaymentPIDModal, setSendPaymentPIDModal] = useState(false);
    const [sendPaymentAmountModal, setSendPaymentAmountModal] = useState(false);
    const [sendPaymentWalletPinModal, setSendPaymentWalletPinModal] = useState(false);
    const [sendPaymentStatusModal, setSendPaymentStatusModal] = useState(false);

    const goBackFromEnterAmount = () => {
        setEnterAmountModal(false);
        setChooseFundMethodModal(true);
        setFundAmount(null);
        setFundMethod(null);
    };

    const goBackFromEnterWithdrawAmount = () => {
        setEnterWithdrawAmountModal(false);
        setEnterWalletPinModal(false);
        setFundWithdrawAmount(null);
    };
    
    const goBackFromWithdrawStatus = () => {
        setWithdrawalPaymentStatusModal(false);
        setFundWithdrawAmount(null);
    };

    const goBackFromCardDepositStatus = () => {
        setCardDepositStatusModal(false);
        setFundAmount(null);
    };

    const goBackFromRequestPaymentStatus = () => {
        setRequestPaymentStatusModal(false);
        setRequestPaymentAmount(null);
        setRequestUniqueID(null);
    };

    const goBackFromConfirmPayment = () => {
        setConfirmPaymentModal(false);
        setEnterAmountModal(true);
    };

    const goBackFromSendPaymentPID = () => {
        setSendPaymentPIDModal(false);
        setSendPaymentAmountModal(false);
        setSendPaymentWalletPinModal(false);
        setSendPaymentPID(null);
    };
    
    const goBackFromSendPaymentAmount = () => {
        setSendPaymentAmountModal(false);
        setSendPaymentWalletPinModal(false);
        setSendPaymentPIDModal(true);
        setSendPaymentAmount(null);
    };
    
    const goBackFromSendPaymentStatus = () => {
        setSendPaymentStatusModal(false);
        setSendPaymentAmount(null);
        setSendPaymentPID(null);
    };

    const cancelPayment = () => {
        setChooseFundMethodModal(false);
        setEnterAmountModal(false);
        setConfirmPaymentModal(false);
        setFundAmount(null);
        setFundMethod(null);
    };

    const cancelPaymentAlt = () => {
        setChooseFundMethodModal(false);
        setEnterAmountModal(false);
        setConfirmPaymentModal(false);
        setBankAccountAndChargeModal(false);
        setFundAmount(null);
        setFundMethod(null);
    };

    const cancelSendPayment = () => {
        setChooseSendOptionModal(false);
        setSendOption(null);
    };

    const cancelDeposit = async (unique_id) => {
        setPaymentLoading(true);
        const userToken = await AsyncStorage.getItem('userToken');
        fetch(`${BaseUrl}/user/transaction/cancel/deposit`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'passcoder-access-key': "passcoder_" + internal_character_key,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                unique_id: unique_id
			})
        }).then(async (res) => {
            const response = await res.json();
            if (response.success) {
                setPaymentLoading(false);
                setChooseFundMethodModal(false);
                setEnterAmountModal(false);
                setConfirmPaymentModal(false);
                setBankAccountAndChargeModal(false);
                setFundAmount(null);
                setFundMethod(null);
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: response.message
                });
                GetTransactionHistory();
            } else {
                setPaymentLoading(false);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: res.status !== 422 ? response.message : response.data[0].msg
                });
            }
        }).catch((err) => {
            setPaymentLoading(false);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "An error occured!"
            })
        })
    };

    async function CancelDeposit(id, amount) {
        Alert.alert('Cancel Deposit', `Are you sure you want to cancel the NGN ${digit_filter(amount)} deposit?`, [
            {
                text: "No"
            }, {
                text: "Yes",
                onPress: async () => {
                    const userToken = await AsyncStorage.getItem('userToken')
                    fetch(`${BaseUrl}/user/transaction/cancel/deposit`, {
                        method: "POST",
                        headers: {
                            'passcoder-access-token': userToken,
                            'passcoder-access-key': "passcoder_" + internal_character_key,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            unique_id: id
                        })
                    }).then(async (res) => {
                        const response = await res.json();
                        if (response.success === true) {
                            GetTransactionHistory()
                            Toast.show({
                                type: "success",
                                text1: "Success",
                                text2: "Deposit Cancelled!"
                            })
                        } else {
                            Toast.show({
                                type: "error",
                                text1: "Error",
                                text2: "An error occured!"
                            })
                        }
                    }).catch(() => {
                        GetTransactionHistory()
                    })
                }
            }
        ])
    };

    const confirmDepositPaymentViaTransfer = () => {
        setChooseFundMethodModal(false);
        setEnterAmountModal(false);
        setConfirmPaymentModal(false);
        setBankAccountAndChargeModal(false);
        setFundAmount(null);
        setFundMethod(null);
        GetTransactionHistory();
    };

    const checkForFundingStatus = () => {
        if (passUser?.virtual_account_number && passUser?.virtual_account_name && passUser?.virtual_bank) {
            // setChooseFundMethodModal(true);
            // setBankAccountModal(true);
            nav.navigate("DepositAmount", {
                passUser: passUser
            });
        } else {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Verify your BVN to enable funding"
            })
        }
    };

    const checkForSendingStatus = () => {
        if (passUser?.virtual_account_number && passUser?.virtual_account_name && passUser?.virtual_bank) {
            setChooseSendOptionModal(true);
        } else {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Verify your BVN to enable sending"
            })
        }
    };

    const checkForWithdrawalStatus = () => {
        if (passUser?.account_number && passUser?.account_name && passUser?.bank) {
            nav.navigate("WithdrawalAmount", {
                fundWithdrawMethod: payment_methods.transfer,
                passUser: passUser
            });
        } else {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Upload bank details in profile"
            })
        }
    };

    const onPaystackSuccess = async (res) => {
        setCardDepositStatusModal(true);
        setCardDepositLoading(true);
        const userToken = await AsyncStorage.getItem('userToken');
        setFundMethod(null);
        fetch(`${BaseUrl}/user/transaction/payment/deposit/via/card`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'passcoder-access-key': "passcoder_" + internal_character_key,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: fundAmount,
                payment_method: fundMethod,
                reference: res.transactionRef.reference
            })
        }).then(async (res) => {
            const response = await res.json();
            if (response.success) {
                setCardDepositLoading(false);
                setCardDepositErrorMessage(null);
                setCardDepositSuccessMessage(response.message);
            } else {
                setCardDepositLoading(false);
                setCardDepositSuccessMessage(null);
                setCardDepositErrorMessage(res.status !== 422 ? response.message : response.data[0].msg);
            }
        }).catch((err) => {
            setCardDepositLoading(false);
            setCardDepositSuccessMessage(null);
            setCardDepositErrorMessage("An error occured!");
        })
    };

    const addDeposit = async () => {
        const userToken = await AsyncStorage.getItem('userToken');
        if (fundMethod === payment_methods.card) {
            if (fundAmount > credit_card_max_amount) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: `Maximum card deposit is ${digit_filter(credit_card_max_amount)} Naira`
                });
            } else {
                setPaymentLoading(true);
                fetch(`${BaseUrl}/user/public/key/paystack/and/payments/charge/price`, {
                    method: "POST",
                    headers: {
                        'passcoder-access-token': userToken,
                        'passcoder-access-key': "passcoder_" + internal_character_key,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: fundAmount
                    })
                }).then(async (res) => {
                    const response = await res.json();
                    if (response.success) {
                        setPaymentLoading(false);
                        let publicKey = response.data.key;
                        let charge = response.data.charge;
                        setPaystackConfig({
                            paystackKey: publicKey,
                            billingEmail: passUser.email,
                            billingMobile: passUser.phone_number,
                            billingName: passUser?.firstname + " " + passUser?.middlename ? passUser?.middlename + " " : "" + passUser?.lastname,
                            amount: fundAmount + charge,
                            channels: ["card"],
                            refNumber: "TXU" + random_numbers(12)
                        });
                        setConfirmPaymentModal(false);
                        paystackWebViewRef.current.startTransaction();
                    } else {
                        setPaymentLoading(false);
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: res.status !== 422 ? response.message : response.data[0].msg
                        });
                    }
                }).catch((err) => {
                    setPaymentLoading(false);
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: "An error occured!"
                    })
                })
            }
        } else if (fundMethod === payment_methods.transfer) {
            if (fundAmount > transfer_max_amount) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: `Maximum transfer deposit is ${digit_filter(transfer_max_amount)} Naira`
                });
            } else {
                setPaymentLoading(true);
                fetch(`${BaseUrl}/user/virtual/account/and/payments/charge/price`, {
                    method: "POST",
                    headers: {
                        'passcoder-access-token': userToken,
                        'passcoder-access-key': "passcoder_" + internal_character_key,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: fundAmount
                    })
                }).then(async (res) => {
                    const response = await res.json();
                    if (response.success) {
                        setPaymentLoading(false);
                        setCompanyBankDetails(response.data.bank_account);
                        setChargePrice(response.data.charge);
                        // setTransactionUniqueID(response.data.unique_id);
                        setConfirmPaymentModal(false);
                        setBankAccountAndChargeModal(true);
                    } else {
                        setPaymentLoading(false);
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: res.status !== 422 ? response.message : response.data[0].msg
                        });
                    }
                }).catch((err) => {
                    setPaymentLoading(false);
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: "An error occured!"
                    })
                })
            }
        } else {
            setPaymentLoading(false);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please select payment method"
            });
        }
    };

    const cancelWithdrawalPayment = () => {
        setEnterWithdrawAmountModal(false);
        setConfirmWithdrawPaymentModal(false);
        setFundWithdrawAmount(null);
    };

    const authorizeWithdrawal = async (pin, amount) => {
        const userToken = await AsyncStorage.getItem('userToken');
        fetch(`${BaseUrl}/user/transaction/payment/withdrawal`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'passcoder-access-key': "passcoder_" + internal_character_key,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pin: pin,
                amount: amount,
                payment_method: fundWithdrawMethod
            })
        }).then(async (res) => {
            const response = await res.json();
            if (response.success) {
                setPaymentWithdrawalLoading(false);
                setPaymentWithdrawalErrorMessage(null);
                setPaymentWithdrawalSuccessMessage("Your withdrawal request has been submitted and will be processed shortly.");
            } else {
                setPaymentWithdrawalLoading(false);
                setPaymentWithdrawalSuccessMessage(null);
                setPaymentWithdrawalErrorMessage(res.status !== 422 ? response.message : response.data[0].msg);
            }
        }).catch((err) => {
            setPaymentWithdrawalLoading(false);
            setPaymentWithdrawalErrorMessage("An error occured!");
        })
    };

    const authorizePayment = async (pin, unique_id, pid) => {
        const userToken = await AsyncStorage.getItem('userToken');
        fetch(`${BaseUrl}/user/wallet/pin/verify`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pin: pin,
                pid: pid
            })
        }).then(async (res) => {
            const response = await res.json();
            if (response.success) {
                fetch(`${BaseUrl}/user/accept/request`, {
                    method: "POST",
                    headers: {
                        'passcoder-access-token': userToken,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        unique_id: unique_id
                    })
                }).then(async (res) => {
                    const response = await res.json();
                    if (response.success === true) {
                        setAcceptLoading(false);
                        setPendingRequests([]);
                        setRequestPaymentErrorMessage(null);
                        setRequestPaymentSuccessMessage("Your payment has been processed successfully.");
                    } else {
                        setAcceptLoading(false);
                        setRequestPaymentSuccessMessage(null);
                        setRequestPaymentErrorMessage(res.status !== 422 ? response.message : response.data[0].msg);
                    }
                }).catch((err) => {
                    setAcceptLoading(false);
                    setRequestPaymentSuccessMessage(null);
                    setRequestPaymentErrorMessage("An error occured!!");
                })
            } else {
                setAcceptLoading(false);
                setRequestPaymentSuccessMessage(null);
                setRequestPaymentErrorMessage(res.status !== 422 ? response.message : response.data[0].msg);
            }
        }).catch((err) => {
            setAcceptLoading(false);
            setRequestPaymentSuccessMessage(null);
            setRequestPaymentErrorMessage("An error occured!");
        })
    };

    const sendPayment = async (pin, pid, amount) => {
        const userToken = await AsyncStorage.getItem('userToken');
        fetch(`${BaseUrl}/user/transaction/send/payment`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'passcoder-access-key': "passcoder_" + internal_character_key,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pin: pin,
                amount: amount,
                recipient_pid: pid
            })
        }).then(async (res) => {
            const response = await res.json();
            if (response.success) {
                setSendPaymentLoading(false);
                setSendPaymentErrorMessage(null);
                setSendPaymentSuccessMessage("Your transaction has been processed successfully.");
            } else {
                setSendPaymentLoading(false);
                setSendPaymentSuccessMessage(null);
                setSendPaymentErrorMessage(res.status !== 422 ? response.message : response.data[0].msg);
            }
        }).catch((err) => {
            setSendPaymentLoading(false);
            setSendPaymentErrorMessage("An error occured!");
        })
    };

    const enterWalletPin = () => {
        setConfirmWithdrawPaymentModal(false);
        setEnterWalletPinModal(true);
    };

    const retryPin = () => {
        setWithdrawalPaymentStatusModal(false);
        setEnterWalletPinModal(true);
    };

    const retryPaymentPin = () => {
        setRequestPaymentStatusModal(false);
        setAuthorizePaymentModal(true);
    };

    const retrySendPaymentPin = () => {
        setSendPaymentStatusModal(false);
        setSendPaymentWalletPinModal(true);
    };

    const okayWithdrawal = () => {
        setWithdrawalPaymentStatusModal(false);
        setFundWithdrawAmount(null);
        GetTransactionHistory();
    };

    const okayCardDeposit = () => {
        setCardDepositStatusModal(false);
        setFundAmount(null);
        GetTransactionHistory();
    };

    const okayPayment = () => {
        setRequestPaymentStatusModal(false);
        setRequestPaymentAmount(null);
        setRequestUniqueID(null);
        GetPendingPaymentRequests();
        getCurrentUser();
    };

    const okaySendPayment = () => {
        setSendPaymentStatusModal(false);
        setSendPaymentAmount(null);
        setSendPaymentPID(null);
        GetTransactionHistory();
    };

    async function CancelWithdrawal(id, amount) {
        Alert.alert('Cancel Withdrawal', `Are you sure you want to cancel the NGN ${digit_filter(amount)} withdrawal?`, [
            {
                text: "No"
            }, {
                text: "Yes",
                onPress: async () => {
                    const userToken = await AsyncStorage.getItem('userToken')
                    fetch(`${BaseUrl}/user/transaction/cancel/withdrawal`, {
                        method: "POST",
                        headers: {
                            'passcoder-access-token': userToken,
                            'passcoder-access-key': "passcoder_" + internal_character_key,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            unique_id: id
                        })
                    }).then(async (res) => {
                        const response = await res.json();
                        if (response.success === true) {
                            GetTransactionHistory()
                            Toast.show({
                                type: "success",
                                text1: "Success",
                                text2: "Withdrawal Cancelled!"
                            })
                        } else {
                            Toast.show({
                                type: "error",
                                text1: "Error",
                                text2: "An error occured!"
                            })
                        }
                    }).catch(() => {
                        GetTransactionHistory()
                    })
                }
            }
        ])
    };

    const ChooseFundMethodModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={chooseFundMethodModal}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        <View style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 10, color: AppColor.Blue }}>Fund Wallet</Text>
                                <MaterialCommunityIcons name="close" size={24} color={AppColor.Blue} style={{ marginRight: 10, marginTop: -10 }} onPress={() => cancelPayment()} />
                            </View>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 10 }}>Choose a method to fund your wallet</Text>
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                            <TouchableOpacity onPress={(ev) => handleCardPaymentSubmit(ev, passUser)} style={{ flexDirection: "row", backgroundColor: `${fundMethod === payment_methods.card ? AppColor.Blue : "#eee"}`, height: 50, marginTop: 10, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                                <Text style={{ fontFamily: "lexendMedium", color: `${fundMethod === payment_methods.card ? "white" : "grey"}`, paddingLeft: 20 }}>Fund with your card</Text>
                                <MaterialCommunityIcons name="arrow-right-thin" size={24} color={`${fundMethod === payment_methods.card ? "white" : "grey"}`} style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={(ev) => handleTransferPaymentSubmit(ev, passUser)} style={{ flexDirection: "row", backgroundColor: `${fundMethod === payment_methods.transfer ? AppColor.Blue : "#eee"}`, height: 50, marginTop: 15, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                                <Text style={{ fontFamily: "lexendMedium", color: `${fundMethod === payment_methods.transfer ? "white" : "grey"}`, paddingLeft: 20 }}>Fund via transfer</Text>
                                <MaterialCommunityIcons name="arrow-right-thin" size={24} color={`${fundMethod === payment_methods.transfer ? "white" : "grey"}`} style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };

    const EnterAmountModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={enterAmountModal} avoidKeyboard={true}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        <View style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 10, color: AppColor.Blue }}>Amount</Text>
                                <MaterialCommunityIcons name="arrow-left-thin" size={24} color={AppColor.Blue} style={{ marginRight: 10, marginTop: -10 }} onPress={() => goBackFromEnterAmount()} />
                            </View>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 10 }}>Amount to fund via {fundMethod}</Text>
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                            <View style={{ marginBottom: 20 }}>
                                <TextInput
                                    ref={fundAmountRef}
                                    maxLength={11}
                                    style={styles.textInput}
                                    onEndEditing={handleFundAmountSubmit}
                                    keyboardType='numeric'
                                    placeholder='Enter amount (NGN)' />
                                {
                                    fundMethod ? 
                                        <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginTop: 10, color: "red" }}>{"\u20A6"}{" "}1,000 - {"\u20A6"}{" "}{fundMethod === payment_methods.card ? digit_filter(credit_card_max_amount) : digit_filter(transfer_max_amount)}</Text> : 
                                        <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginTop: 10 }}>Minimum {"\u20A6"}{" "}1,000</Text>
                                }
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };

    const ConfirmPaymentModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={confirmPaymentModal}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                            <MaterialCommunityIcons name={"wallet-plus"} size={30} color={"green"} />
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 10, color: AppColor.Blue }}>Confirm Deposit</Text>
                                <MaterialCommunityIcons name="arrow-left-thin" size={24} color={AppColor.Blue} style={{ marginRight: 10, marginTop: -10 }} onPress={() => goBackFromConfirmPayment()} />
                            </View>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 17, marginBottom: 10 }}>Payment via {fundMethod}</Text>
                            <Text style={{ fontFamily: "lexendMedium", fontSize: 19, marginBottom: 5 }}><Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(fundAmount ? fundAmount : 0)}</Text>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 10 }}>Plus charge {fundMethod === payment_methods.card ? "~ \u20A6 100" : "~ \u20A6 50 - \u20A6 100"}</Text>
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <TouchableOpacity onPress={() => cancelPayment()} style={{ backgroundColor: "red", height: 35, borderRadius: 8, width: (Dimensions.get("window").width * 40) / 100, justifyContent: "center", alignItems: "center", margin: 5 }}>
                                    <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => addDeposit()} disabled={paymentLoading} style={{ backgroundColor: paymentLoading ? "grey" : "green", height: 35, borderRadius: 8, width: (Dimensions.get("window").width * 40) / 100, justifyContent: "center", alignItems: "center", margin: 5 }}>
                                    {paymentLoading ? (
                                        <ActivityIndicator color={"#fff"} size={'small'} />
                                    ) : (
                                        <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Pay</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };

    const CardDepositStatusModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={cardDepositStatusModal}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        {
                            cardDepositLoading ?
                                <>
                                    <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: AppColor.Blue, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20, marginBottom: 10 }}>
                                        <ActivityIndicator color={"#fff"} size={'large'} />
                                    </View>
                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 20, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Processing ...</Text>
                                </> :
                                <>
                                    {
                                        cardDepositErrorMessage ?
                                            <>
                                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                                    <View></View>
                                                    <MaterialCommunityIcons name="close" size={24} color={AppColor.Blue} style={{ marginRight: 15, marginTop: 10 }} onPress={() => goBackFromCardDepositStatus()} />
                                                </View>
                                                <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center" }}>
                                                    <Ionicons name={"checkmark"} size={30} color={"coral"} />
                                                </View>
                                                <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                                                    <Text style={{ marginLeft: 15, marginRight: 15, marginTop: 10, fontFamily: 'lexendBold', fontSize: 20, marginBottom: 5, color: "#000", justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Deposit pending</Text>
                                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5, color: "red", justifyContent: "center", alignItems: "center", alignSelf: "center", marginLeft: 5, marginRight: 5 }}>{cardDepositErrorMessage}</Text>
                                                    <TouchableOpacity onPress={() => okayCardDeposit()} style={{ backgroundColor: AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
                                                        <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </> :
                                            <>
                                                <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "green", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                                                    <MaterialCommunityIcons name={"check"} size={30} color={"#fff"} />
                                                </View>
                                                <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                                                    <Text style={{ marginLeft: 15, marginRight: 15, marginTop: 10, fontFamily: 'lexendBold', fontSize: 20, marginBottom: 5, color: AppColor.Blue, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Deposit successful</Text>
                                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5, justifyContent: "center", alignItems: "center", alignSelf: "center", marginLeft: 5, marginRight: 5 }}>{cardDepositSuccessMessage}</Text>
                                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 20, marginBottom: 10, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>+ <Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(fundAmount ? fundAmount : 0)}</Text>
                                                    <TouchableOpacity onPress={() => okayCardDeposit()} style={{ backgroundColor: AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
                                                        <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                    }
                                </>
                        }
                    </View>
                </View>
            </Modal>
        )
    };

    const BankAccountAndChargeModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={bankAccountAndChargeModal}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                            <MaterialCommunityIcons name={"bank"} size={30} color={"green"} />
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginTop: 20, marginBottom: 10 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 10, color: AppColor.Blue }}>Payment details</Text>
                                {/* <MaterialCommunityIcons name="cancel" size={24} color={paymentLoading ? "grey" : "red"} style={{ marginRight: 10, marginTop: -10 }} onPress={() => { if (!paymentLoading) cancelDeposit(transactionUniqueID) }} /> */}
                                <MaterialCommunityIcons name="cancel" size={24} color={"red"} style={{ marginRight: 10, marginTop: -10 }} onPress={() => cancelPaymentAlt()} />
                            </View>
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>Amount (NGN)</Text>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}><Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(fundAmount ? fundAmount : 0)}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>Charge</Text>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}><Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(chargePrice ? chargePrice : 0)}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>Account Name</Text>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>{companyBankDetails.virtual_account_name}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>Account Number</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                    <TouchableOpacity onPress={async () => {
                                        await Clipboard.setStringAsync(companyBankDetails.virtual_account_number).then(() => {
                                            Toast.show({
                                                type: "success",
                                                text1: "Success",
                                                text2: "Account number copied!"
                                            })
                                        })
                                    }} style={{ marginRight: 5 }}>
                                        <MaterialIcons name="content-copy" size={18} color="black" />
                                    </TouchableOpacity>
                                    <Text onPress={async () => {
                                        await Clipboard.setStringAsync(companyBankDetails.virtual_account_number).then(() => {
                                            Toast.show({
                                                type: "success",
                                                text1: "Success",
                                                text2: "Account number copied!"
                                            })
                                        })
                                    }} style={{ fontFamily: 'lexendMedium', textDecorationLine: "underline", textDecorationColor: AppColor.Blue, fontSize: 12, marginBottom: 5 }}>
                                        {companyBankDetails.virtual_account_number}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>Bank</Text>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>{companyBankDetails.virtual_bank}</Text>
                            </View>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 20, marginBottom: 10, marginTop: 10, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Pay <Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(fundAmount ? fundAmount + chargePrice : 0)}</Text>
                            <TouchableOpacity onPress={() => confirmDepositPaymentViaTransfer()} disabled={paymentLoading} style={{ backgroundColor: paymentLoading ? "grey" : AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
                                {paymentLoading ? (
                                    <ActivityIndicator color={"#fff"} size={'small'} />
                                ) : (
                                    <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>I've transferred</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };

    const ConfirmWithdrawalPaymentModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={confirmWithdrawPaymentModal}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                            <MaterialCommunityIcons name={"bank"} size={30} color={"green"} />
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginTop: 20, marginBottom: 10 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 10, color: AppColor.Blue }}>Confirm Withdrawal</Text>
                                <MaterialCommunityIcons name="cancel" size={24} color={paymentLoading ? "grey" : "red"} style={{ marginRight: 10, marginTop: -10 }} onPress={() => { cancelWithdrawalPayment() }} />
                            </View>
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>Amount (NGN)</Text>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}><Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(fundWithdrawAmount ? fundWithdrawAmount : 0)}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>Account Name</Text>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>{passUser.account_name}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>Account Number</Text>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>{passUser.account_number}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>Bank</Text>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>{passUser.bank}</Text>
                            </View>
                            <TouchableOpacity onPress={() => enterWalletPin()} disabled={paymentLoading} style={{ backgroundColor: paymentLoading ? "grey" : AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
                                {paymentWithdrawalLoading ? (
                                    <ActivityIndicator color={"#fff"} size={'small'} />
                                ) : (
                                    <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Next</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };

    const EnterWithdrawAmountModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={enterWithdrawAmountModal} avoidKeyboard={true}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        <View style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 10, color: AppColor.Blue }}>Withdraw</Text>
                                <MaterialCommunityIcons name="close" size={24} color={AppColor.Blue} style={{ marginRight: 10, marginTop: -10 }} onPress={() => goBackFromEnterWithdrawAmount()} />
                            </View>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 10 }}>Amount to withdraw from wallet</Text>
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                            <View style={{ marginBottom: 20 }}>
                                <TextInput
                                    ref={fundWithdrawAmountRef}
                                    maxLength={11}
                                    style={styles.textInput}
                                    onEndEditing={(ev) => handleWithdrawFundAmountSubmit(ev, passUser)}
                                    keyboardType='numeric'
                                    placeholder='Enter amount (NGN)' />
                                {
                                    passUser ?
                                        <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginTop: 10, color: "red" }}>{"\u20A6"}{" "}1,000 - {"\u20A6"}{" "}{passUser?.balance}</Text> :
                                        <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginTop: 10 }}>Minimum {"\u20A6"}{" "}1,000</Text>
                                }
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };

    const EnterWalletPinModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={enterWalletPinModal} avoidKeyboard={true}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        <View style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 10, color: AppColor.Blue }}>Authorize Withdrawal</Text>
                                <MaterialCommunityIcons name="close" size={24} color={AppColor.Blue} style={{ marginRight: 10, marginTop: -10 }} onPress={() => goBackFromEnterWithdrawAmount()} />
                            </View>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 10 }}>Enter wallet pin to authorize transaction</Text>
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                            <View style={{ marginBottom: 20 }}>
                                <TextInput
                                    ref={walletPinRef}
                                    secureTextEntry={true}
                                    maxLength={4}
                                    style={styles.textInput}
                                    onEndEditing={(ev) => handleWalletPinSubmit(ev, fundWithdrawAmount)}
                                    keyboardType='numeric'
                                    placeholder='Wallet pin' />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };

    const WithdrawalPaymentStatusModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={withdrawalPaymentStatusModal}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        {
                            paymentWithdrawalLoading ? 
                                <>
                                    <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: AppColor.Blue, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20, marginBottom: 10 }}>
                                        <ActivityIndicator color={"#fff"} size={'large'} />
                                    </View>
                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 20, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Processing ...</Text>
                                </> : 
                                <>
                                    {
                                        paymentWithdrawalErrorMessage ? 
                                            <>
                                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                                    <View></View>
                                                    <MaterialCommunityIcons name="close" size={24} color={AppColor.Blue} style={{ marginRight: 15, marginTop: 10 }} onPress={() => goBackFromWithdrawStatus()} />
                                                </View>
                                                <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center" }}>
                                                    <Ionicons name={"warning-outline"} size={30} color={"red"} />
                                                </View>
                                                <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                                                    <Text style={{ marginLeft: 15, marginRight: 15, marginTop: 10, fontFamily: 'lexendBold', fontSize: 20, marginBottom: 5, color: "#000", justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Request Error</Text>
                                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5, color: "red", justifyContent: "center", alignItems: "center", alignSelf: "center", marginLeft: 5, marginRight: 5 }}>{paymentWithdrawalErrorMessage}</Text>
                                                    <TouchableOpacity onPress={() => retryPin()} style={{ backgroundColor: AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
                                                        <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Retry</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </> : 
                                            <>
                                                <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "green", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                                                    <MaterialCommunityIcons name={"check"} size={30} color={"#fff"} />
                                                </View>
                                                <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                                                    <Text style={{ marginLeft: 15, marginRight: 15, marginTop: 10, fontFamily: 'lexendBold', fontSize: 20, marginBottom: 5, color: AppColor.Blue, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Request Pending</Text>
                                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5, justifyContent: "center", alignItems: "center", alignSelf: "center", marginLeft: 5, marginRight: 5 }}>{paymentWithdrawalSuccessMessage}</Text>
                                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 20, marginBottom: 10, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>- <Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(fundWithdrawAmount ? fundWithdrawAmount : 0)}</Text>
                                                    <TouchableOpacity onPress={() => okayWithdrawal()} style={{ backgroundColor: AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
                                                        <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                    }
                                </>
                        }
                    </View>
                </View>
            </Modal>
        )
    };

    const AuthorizePaymentModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={authorizePaymentModal} avoidKeyboard={true}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        <View style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 10, color: AppColor.Blue }}>Authorize Payment</Text>
                            </View>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 10 }}>Enter wallet pin to authorize payment</Text>
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                            <View style={{ marginBottom: 20 }}>
                                <TextInput
                                    ref={walletPinRef}
                                    secureTextEntry={true}
                                    maxLength={4}
                                    style={styles.textInput}
                                    onEndEditing={(ev) => handleWalletPinPaymentSubmit(ev, requestUniqueID, passUser?.pid)}
                                    keyboardType='numeric'
                                    placeholder='Wallet pin' />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };

    const RequestPaymentStatusModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={requestPaymentStatusModal}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        {
                            acceptLoading ?
                                <>
                                    <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: AppColor.Blue, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20, marginBottom: 10 }}>
                                        <ActivityIndicator color={"#fff"} size={'large'} />
                                    </View>
                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 20, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Authenticating ...</Text>
                                </> :
                                <>
                                    {
                                        requestPaymentErrorMessage ?
                                            <>
                                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                                    <View></View>
                                                    <MaterialCommunityIcons name="close" size={24} color={AppColor.Blue} style={{ marginRight: 15, marginTop: 10 }} onPress={() => goBackFromRequestPaymentStatus()} />
                                                </View>
                                                <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center" }}>
                                                    <Ionicons name={"warning-outline"} size={30} color={"red"} />
                                                </View>
                                                <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                                                    <Text style={{ marginLeft: 15, marginRight: 15, marginTop: 10, fontFamily: 'lexendBold', fontSize: 20, marginBottom: 5, color: "#000", justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Error</Text>
                                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5, color: "red", justifyContent: "center", alignItems: "center", alignSelf: "center", marginLeft: 5, marginRight: 5 }}>{requestPaymentErrorMessage}</Text>
                                                    <TouchableOpacity onPress={() => retryPaymentPin()} style={{ backgroundColor: AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
                                                        <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Retry</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </> :
                                            <>
                                                <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "green", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                                                    <MaterialCommunityIcons name={"check"} size={30} color={"#fff"} />
                                                </View>
                                                <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                                                    <Text style={{ marginLeft: 15, marginRight: 15, marginTop: 10, fontFamily: 'lexendBold', fontSize: 20, marginBottom: 5, color: AppColor.Blue, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Success</Text>
                                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5, justifyContent: "center", alignItems: "center", alignSelf: "center", marginLeft: 5, marginRight: 5 }}>{requestPaymentSuccessMessage}</Text>
                                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 20, marginBottom: 10, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>- <Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(requestPaymentAmount ? requestPaymentAmount : 0)}</Text>
                                                    <TouchableOpacity onPress={() => okayPayment()} style={{ backgroundColor: AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
                                                        <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                    }
                                </>
                        }
                    </View>
                </View>
            </Modal>
        )
    };

    const BankAccountModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={bankAccountModal}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                            <MaterialCommunityIcons name={"bank"} size={30} color={"green"} />
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginTop: 20, marginBottom: 10 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 10, color: AppColor.Blue }}>Account details</Text>
                                {/* <MaterialCommunityIcons name="cancel" size={24} color={"red"} style={{ marginRight: 10, marginTop: -10 }} onPress={() => setBankAccountModal(false)} /> */}
                            </View>
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>Name</Text>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5, flexWrap: 'wrap', maxWidth: (Dimensions.get('screen').width * 70) / 100 }}>{passUser.virtual_account_name}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>Acc No.</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                    <TouchableOpacity onPress={async () => {
                                        await Clipboard.setStringAsync(passUser.virtual_account_number).then(() => {
                                            Toast.show({
                                                type: "success",
                                                text1: "Success",
                                                text2: "Account number copied!"
                                            })
                                        })
                                    }} style={{ marginRight: 5 }}>
                                        <MaterialIcons name="content-copy" size={18} color="black" />
                                    </TouchableOpacity>
                                    <Text onPress={async () => {
                                        await Clipboard.setStringAsync(passUser.virtual_account_number).then(() => {
                                            Toast.show({
                                                type: "success",
                                                text1: "Success",
                                                text2: "Account number copied!"
                                            })
                                        })
                                    }} style={{ fontFamily: 'lexendMedium', textDecorationLine: "underline", textDecorationColor: AppColor.Blue, fontSize: 15, marginBottom: 5 }}>
                                        {passUser.virtual_account_number}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>Bank</Text>
                                <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>{passUser.virtual_bank}</Text>
                            </View>
                            
                            <TouchableOpacity onPress={() => setBankAccountModal(false)} style={{ backgroundColor: AppColor.Blue, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
                                <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Got it</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };

    const ChooseSendOptionModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={chooseSendOptionModal}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        <View style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 10, color: AppColor.Blue }}>Send Money</Text>
                                <MaterialCommunityIcons name="close" size={24} color={AppColor.Blue} style={{ marginRight: 10, marginTop: -10 }} onPress={() => cancelSendPayment()} />
                            </View>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 10 }}>Choose an option to send funds</Text>
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                            <TouchableOpacity onPress={(ev) => handleSendUserOptionSubmit(ev, passUser)} style={{ flexDirection: "row", backgroundColor: `${sendOption === send_payment_options.passcoder_user ? AppColor.Blue : "#eee"}`, height: 50, marginTop: 10, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                                <Text style={{ fontFamily: "lexendMedium", color: `${sendOption === send_payment_options.passcoder_user ? "white" : "grey"}`, paddingLeft: 20 }}>{send_payment_options.passcoder_user}</Text>
                                <MaterialCommunityIcons name="arrow-right-thin" size={24} color={`${sendOption === send_payment_options.passcoder_user ? "white" : "grey"}`} style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={(ev) => handleSendPartnerOptionSubmit(ev, passUser)} style={{ flexDirection: "row", backgroundColor: `${sendOption === send_payment_options.passcoder_partner ? AppColor.Blue : "#eee"}`, height: 50, marginTop: 15, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                                <Text style={{ fontFamily: "lexendMedium", color: `${sendOption === send_payment_options.passcoder_partner ? "white" : "grey"}`, paddingLeft: 20 }}>{send_payment_options.passcoder_partner}</Text>
                                <MaterialCommunityIcons name="arrow-right-thin" size={24} color={`${sendOption === send_payment_options.passcoder_partner ? "white" : "grey"}`} style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={(ev) => handleSendBankTransferOptionSubmit(ev, passUser)} style={{ flexDirection: "row", backgroundColor: `${sendOption === send_payment_options.bank_transfer ? AppColor.Blue : "#eee"}`, height: 50, marginTop: 15, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                                <Text style={{ fontFamily: "lexendMedium", color: `${sendOption === send_payment_options.bank_transfer ? "white" : "grey"}`, paddingLeft: 20 }}>{send_payment_options.bank_transfer}</Text>
                                <MaterialCommunityIcons name="arrow-right-thin" size={24} color={`${sendOption === send_payment_options.bank_transfer ? "white" : "grey"}`} style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };

    const SendPaymentPIDModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={sendPaymentPIDModal} avoidKeyboard={true}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        <View style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 10, color: AppColor.Blue }}>Send money</Text>
                                <MaterialCommunityIcons name="close" size={24} color={AppColor.Blue} style={{ marginRight: 10, marginTop: -10 }} onPress={() => goBackFromSendPaymentPID()} />
                            </View>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 10 }}>Enter recipient Passcoder ID</Text>
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                            <View style={{ marginBottom: 20 }}>
                                <TextInput
                                    ref={sendPaymentPIDRef}
                                    autoCapitalize='characters'
                                    maxLength={6}
                                    style={styles.textInput}
                                    onEndEditing={handleSendPaymentPIDSubmit}
                                    keyboardType='default'
                                    placeholder='Enter Passcoder ID' />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };

    const SendPaymentAmountModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={sendPaymentAmountModal} avoidKeyboard={true}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        <View style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 10, color: AppColor.Blue }}>Amount</Text>
                                <MaterialCommunityIcons name="arrow-left-thin" size={24} color={AppColor.Blue} style={{ marginRight: 10, marginTop: -10 }} onPress={() => goBackFromSendPaymentAmount()} />
                            </View>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 10 }}>Sending funds to <Text style={{ color: AppColor.Blue }}>{sendPaymentPID}</Text></Text>
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                            <View style={{ marginBottom: 20 }}>
                                <TextInput
                                    ref={sendPaymentAmountRef}
                                    maxLength={11}
                                    style={styles.textInput}
                                    onEndEditing={(ev) => handleSendPaymentAmountSubmit(ev, passUser)}
                                    keyboardType='numeric'
                                    placeholder='Enter amount (NGN)' />
                                {
                                    passUser ?
                                        <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginTop: 10, color: "red" }}>{"\u20A6"}{" "}50 - {"\u20A6"}{" "}{passUser?.balance}</Text> :
                                        <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginTop: 10 }}>Minimum {"\u20A6"}{" "}50</Text>
                                }
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };

    const SendPaymentWalletPinModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={sendPaymentWalletPinModal} avoidKeyboard={true}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        <View style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 10, color: AppColor.Blue }}>Authorize payment</Text>
                                <MaterialCommunityIcons name="close" size={24} color={AppColor.Blue} style={{ marginRight: 10, marginTop: -10 }} onPress={() => goBackFromSendPaymentAmount()} />
                            </View>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 10 }}>Enter wallet pin to authorize transaction</Text>
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                            <View style={{ marginBottom: 20 }}>
                                <TextInput
                                    ref={walletPinRef}
                                    secureTextEntry={true}
                                    maxLength={4}
                                    style={styles.textInput}
                                    onEndEditing = {(ev) => handleSendPaymentWalletPinSubmit(ev, sendPaymentAmount, sendPaymentPID)}
                                    keyboardType='numeric'
                                    placeholder='Wallet pin' />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };

    const SendPaymentStatusModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={sendPaymentStatusModal}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        {
                            sendPaymentLoading ?
                                <>
                                    <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: AppColor.Blue, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20, marginBottom: 10 }}>
                                        <ActivityIndicator color={"#fff"} size={'large'} />
                                    </View>
                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 20, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Processing ...</Text>
                                </> :
                                <>
                                    {
                                        sendPaymentErrorMessage ?
                                            <>
                                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                                    <View></View>
                                                    <MaterialCommunityIcons name="close" size={24} color={AppColor.Blue} style={{ marginRight: 15, marginTop: 10 }} onPress={() => goBackFromSendPaymentStatus()} />
                                                </View>
                                                <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center" }}>
                                                    <Ionicons name={"warning-outline"} size={30} color={"red"} />
                                                </View>
                                                <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                                                    <Text style={{ marginLeft: 15, marginRight: 15, marginTop: 10, fontFamily: 'lexendBold', fontSize: 20, marginBottom: 5, color: "#000", justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Transaction failed</Text>
                                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5, color: "red", justifyContent: "center", alignItems: "center", alignSelf: "center", marginLeft: 5, marginRight: 5 }}>{sendPaymentErrorMessage}</Text>
                                                    <TouchableOpacity onPress={() => retrySendPaymentPin()} style={{ backgroundColor: AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
                                                        <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Retry</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </> :
                                            <>
                                                <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "green", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                                                    <MaterialCommunityIcons name={"check"} size={30} color={"#fff"} />
                                                </View>
                                                <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                                                    <Text style={{ marginLeft: 15, marginRight: 15, marginTop: 10, fontFamily: 'lexendBold', fontSize: 20, marginBottom: 5, color: AppColor.Blue, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Transaction successful</Text>
                                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5, justifyContent: "center", alignItems: "center", alignSelf: "center", marginLeft: 5, marginRight: 5 }}>{sendPaymentSuccessMessage}</Text>
                                                    <Text style={{ fontFamily: 'lexendMedium', fontSize: 20, marginBottom: 10, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>- <Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(sendPaymentAmount ? sendPaymentAmount : 0)}</Text>
                                                    <TouchableOpacity onPress={() => okaySendPayment()} style={{ backgroundColor: AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
                                                        <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                    }
                                </>
                        }
                    </View>
                </View>
            </Modal>
        )
    };

    const [activeTransactionID, setActiveTransactionID] = useState('');
    const [showEachTransactionModal, setShowEachTransactionModal] = useState(false);

    const [activeRequestID, setActiveRequestID] = useState('');
    const [showEachRequestModal, setShowEachRequestModal] = useState(false);

    const showTransactionIconAndColour = (type) => {
        if (type === "Deposit") {
            return {
                color: "green",
                symbol: "+",
                icon: "wallet-plus"
            }
        } else if (type === "Credit") {
            return {
                color: "green",
                symbol: "+",
                icon: "wallet-plus"
            }
        } else if (type === "Withdrawal") {
            return {
                color: "red",
                symbol: "-",
                icon: "bank-transfer-out"
            }
        } else if (type === "Transfer") {
            return {
                color: "red",
                symbol: "-",
                icon: "bank-transfer-out"
            }
        } else if (type === "Charges") {
            return {
                color: "red",
                symbol: "-",
                icon: "bank-transfer-out"
            }
        } else if (type === "Payment") {
            return {
                color: "red",
                symbol: "-",
                icon: "send"
            }
        } else if (type === "Debit") {
            return {
                color: "red",
                symbol: "-",
                icon: "send"
            }
        } else if (type === "Subscription") {
            return {
                color: "green",
                symbol: "-",
                icon: "transfer-right"
            }
        } else {
            return {
                color: AppColor.Blue,
                symbol: "~",
                icon: "wallet-outline"
            }
        }
    };

    const showTransactionStatusColor = (status) => {
        if (status === "Processing") {
            return {
                color: "coral"
            };
        } else if (status === "Cancelled") {
            return {
                color: "red"
            };
        } else if (status === "Completed") {
            return {
                color: "green"
            };
        } else {
            return {
                color: AppColor.Blue
            };
        }
    };

    const RenderStatus = ({ status }) => {
        if (status === "Completed") {
            return (
                <View style={{ height: 100, width: 5, backgroundColor: "green", borderRadius: 8 }} />
            )
        } else if (status === "Authenticated") {
            return (
                <View style={{ height: 100, width: 5, backgroundColor: "green", borderRadius: 8 }} />
            )
        } else if (status === "Ineligible") {
            return (
                <View style={{ height: 100, width: 5, backgroundColor: "red", borderRadius: 8 }} />
            )
        } else if (status === "Timeout") {
            return (
                <View style={{ height: 100, width: 5, backgroundColor: "coral", borderRadius: 8 }} />
            )
        } else if (status === "Unauthenticated") {
            return (
                <View style={{ height: 100, width: 5, backgroundColor: "red", borderRadius: 8 }} />
            )
        }
    };

    const RenderStatusAlt = (status) => {
        if (status === "Completed") {
            return "green";
        } else if (status === "Authenticated") {
            return "green";
        } else if (status === "Ineligible") {
            return "red";
        } else if (status === "Timeout") {
            return "coral";
        } else if (status === "Unauthenticated") {
            return "red";
        }
    };

    const RenderEachTransaction = () => {
        const [fetchedTransaction, setFetchedTransaction] = useState({});
        const [fetchedTransactionLoading, setFetchedTransactionLoading] = useState(false);

        async function GetTransaction() {
            setFetchedTransactionLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            fetch(`${BaseUrl}/user/transaction`, {
                method: "POST",
                headers: {
                    'passcoder-access-token': userToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({
                    unique_id: activeTransactionID
                })
            }).then(async (res) => {
                setFetchedTransactionLoading(false);
                const response = await res.json();
                setFetchedTransaction(response.data);
            }).catch((err) => {
                setFetchedTransactionLoading(false);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "An error occured!"
                });
            })
        }

        useEffect(() => {
            GetTransaction()
        }, [])
        return (
            <Modal style={{ margin: 0 }} isVisible={showEachTransactionModal} onBackButtonPress={() => setShowEachTransactionModal(false)} onBackdropPress={() => setShowEachTransactionModal(false)}>
                {
                    fetchedTransactionLoading ? (
                        <View style={{ flex: 1, marginTop: (Dimensions.get("window").height * 10) / 100, justifyContent: "center", alignItems: "center" }}>
                            <ActivityIndicator color={AppColor.Blue} size={'large'} />
                        </View>
                    ) : (
                        fetchedTransaction !== null ? (
                            <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                                <View style={{}}>
                                    <View style={{ height: 70, width: 70, borderTopLeftRadius: 50, borderTopRightRadius: 50, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, backgroundColor: `${showTransactionIconAndColour(fetchedTransaction?.type).color}`, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                                        <MaterialCommunityIcons name={showTransactionIconAndColour(fetchedTransaction?.type).icon} size={30} color={"#fff"} />
                                    </View>
                                    <View style={{ alignItems: "center", marginTop: 15 }}>
                                        <Text style={{ fontFamily: 'lexendMedium', fontSize: 20, marginBottom: 10, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>{showTransactionIconAndColour(fetchedTransaction?.type).symbol} <Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(fetchedTransaction?.amount ? fetchedTransaction?.amount : 0)}</Text>
                                    </View>
                                    <View style={{ margin: 15 }}>
                                        {
                                            fetchedTransaction?.reference ?
                                                <>
                                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                                        <Text style={{ fontFamily: 'lexendMedium', fontSize: 14, marginBottom: 5 }}>Reference</Text>
                                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                                            <TouchableOpacity onPress={async () => {
                                                                await Clipboard.setStringAsync(fetchedTransaction?.reference).then(() => {
                                                                    Toast.show({
                                                                        type: "success",
                                                                        text1: "Success",
                                                                        text2: "Reference copied!"
                                                                    })
                                                                })
                                                            }} style={{ marginRight: 5 }}>
                                                                <MaterialIcons name={"content-copy"} size={18} color="black" />
                                                            </TouchableOpacity>
                                                            <Text onPress={async () => {
                                                                await Clipboard.setStringAsync(fetchedTransaction?.reference).then(() => {
                                                                    Toast.show({
                                                                        type: "success",
                                                                        text1: "Success",
                                                                        text2: "Reference copied!"
                                                                    })
                                                                })
                                                                }} style={{ fontFamily: 'lexendLight', textDecorationLine: "underline", textDecorationColor: AppColor.Blue, fontSize: 14, marginBottom: 5, flexWrap: 'wrap', maxWidth: (Dimensions.get('screen').width * 65) / 100 }}>
                                                                {fetchedTransaction?.reference}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                                </> : null
                                        }
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>Amount</Text>
                                            <Text style={{ fontFamily: 'lexendLight', fontSize: 14, marginBottom: 5 }}><Text style={{ fontFamily: "lexendLight" }}>{"\u20A6"}{" "}</Text>{digit_filter(fetchedTransaction?.amount ? fetchedTransaction?.amount : 0)}</Text>
                                        </View>
                                        <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>Transaction</Text>
                                            <Text style={{ fontFamily: 'lexendLight', fontSize: 14, marginBottom: 5 }}>{fetchedTransaction?.type} via {fetchedTransaction?.payment_method}</Text>
                                        </View>
                                        <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>Details</Text>
                                                <Text style={{ fontFamily: 'lexendLight', fontSize: 14, marginBottom: 5, flexWrap: 'wrap', maxWidth: (Dimensions.get('screen').width * 65) / 100 }}>{fetchedTransaction?.details || "No details"}</Text>
                                        </View>
                                        <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                        {
                                            fetchedTransaction?.contact ? 
                                                <>
                                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                                        <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>Contact</Text>
                                                        <Text style={{ fontFamily: 'lexendLight', fontSize: 14, marginBottom: 5, flexWrap: 'wrap', maxWidth: (Dimensions.get('screen').width * 65) / 100 }}>{fetchedTransaction?.contact}</Text>
                                                    </View>
                                                    <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                                </> : null
                                        }
                                        {
                                            fetchedTransaction?.other ? 
                                                <>
                                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                                        <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>Beneficiary</Text>
                                                        <View>
                                                            <Text style={{ fontFamily: 'lexendLight', fontSize: 14, marginBottom: 5, flexWrap: 'wrap', maxWidth: (Dimensions.get('screen').width * 65) / 100 }}>{fetchedTransaction?.other?.name}</Text>
                                                            <Text style={{ fontFamily: 'lexendLight', fontSize: 14, marginBottom: 5 }}>{fetchedTransaction?.other?.account}</Text>
                                                            <Text style={{ fontFamily: 'lexendLight', fontSize: 14, marginBottom: 5, flexWrap: 'wrap', maxWidth: (Dimensions.get('screen').width * 65) / 100 }}>{fetchedTransaction?.other?.bank}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                                </> : null
                                        }
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5 }}>Timestamp</Text>
                                            <Text style={{ fontFamily: 'lexendLight', fontSize: 14, marginBottom: 5, color: "grey" }}>{fetchedTransaction?.updatedAt?.fulldate}</Text>
                                        </View>
                                        <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 15 }}>Status</Text>
                                            <Text style={{ fontFamily: 'lexendLight', fontSize: 14, color: `${showTransactionStatusColor(fetchedTransaction?.transaction_status).color}` }}>{fetchedTransaction?.transaction_status}</Text>
                                        </View>
                                    </View>
                                    <View>
                                        <TouchableOpacity onPress={() => setShowEachTransactionModal(false)} style={{ backgroundColor: AppColor.Blue, height: 45, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 15 }}>
                                            <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

                                <View style={{}}>
                                    <View style={{ height: 70, width: 70, borderTopLeftRadius: 50, borderTopRightRadius: 50, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                                        <Ionicons name="warning" size={30} color="black" />
                                    </View>
                                    <View style={{ alignItems: "center", marginTop: 15 }}>
                                        <Text style={{ fontFamily: 'lexendBold', fontSize: 15, color: "red", marginBottom: 10 }}>Transaction not found</Text>
                                    </View>
                                    <View>
                                        <TouchableOpacity onPress={() => setShowEachTransactionModal(false)} style={{ backgroundColor: AppColor.Blue, height: 45, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 15 }}>
                                            <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                            </View>
                        )
                    )
                }
            </Modal>
        )
    };

    const RenderEachRequest = () => {
        const [fetchedRequest, setFetchedRequest] = useState({});
        const [fetchedRequestLoading, setFetchedRequestLoading] = useState(false);

        async function GetRequest() {
            setFetchedRequestLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            fetch(`${BaseUrl}/user/request`, {
                method: "POST",
                headers: {
                    'passcoder-access-token': userToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({
                    unique_id: activeRequestID
                })
            }).then(async (res) => {
                setFetchedRequestLoading(false);
                const response = await res.json();
                setFetchedRequest(response.data);
            }).catch((err) => {
                setFetchedRequestLoading(false);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "An error occured!"
                });
            })
        }

        useEffect(() => {
            GetRequest()
        }, [])
        return (
            <Modal style={{ margin: 0 }} isVisible={showEachRequestModal} onBackButtonPress={() => setShowEachRequestModal(false)} onBackdropPress={() => setShowEachRequestModal(false)}>
                {
                    fetchedRequestLoading ? (
                        <View style={{ flex: 1, marginTop: (Dimensions.get("window").height * 10) / 100, justifyContent: "center", alignItems: "center" }}>
                            <ActivityIndicator color={AppColor.Blue} size={'large'} />
                        </View>
                    ) : (
                        fetchedRequest?.platform_data !== null ? (
                            <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

                                <View style={{}}>
                                    <View style={{ height: 70, width: 70, borderTopLeftRadius: 50, borderTopRightRadius: 50, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, backgroundColor: `${RenderStatusAlt(fetchedRequest?.status)}`, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                                        <Ionicons name="md-finger-print" size={30} color="#eee" />
                                    </View>
                                    <View style={{ alignItems: "center", marginTop: 15 }}>
                                        <Text style={{ fontFamily: 'lexendBold', fontSize: 16, marginBottom: 5 }}>{fetchedRequest?.platform_data?.name}</Text>
                                        <Text style={{ fontFamily: "lexendMedium", fontSize: 14, marginBottom: 5, margin: 5, textAlign: "center" }}>{fetchedRequest?.type}</Text>
                                        <Text style={{ fontFamily: "lexendMedium", fontSize: 14, color: "grey", marginBottom: 10, margin: 5, textAlign: "center" }}>{fetchedRequest?.details || "No details"}</Text>
                                        <Text style={{ fontFamily: 'lexendLight', fontSize: 12, color: "grey", marginBottom: 10 }}>{fetchedRequest?.updatedAt?.fulldate}</Text>
                                    </View>
                                    <View>
                                        <TouchableOpacity onPress={() => setShowEachRequestModal(false)} style={{ backgroundColor: AppColor.Blue, height: 45, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 15 }}>
                                            <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            fetchedRequest?.partner_data !== null ? (
                                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

                                    <View style={{}}>
                                        <View style={{ height: 70, width: 70, borderTopLeftRadius: 50, borderTopRightRadius: 50, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, backgroundColor: `${RenderStatusAlt(fetchedRequest?.status)}`, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                                            <Ionicons name="md-finger-print" size={30} color="#eee" />
                                        </View>
                                        <View style={{ alignItems: "center", marginTop: 15 }}>
                                            <Text style={{ fontFamily: 'lexendBold', fontSize: 16, marginBottom: 10 }}>{fetchedRequest?.partner_data?.name + ", " + fetchedRequest?.partner_data?.city}</Text>
                                            <Text style={{ fontFamily: "lexendMedium", fontSize: 14, marginBottom: 5, margin: 5, textAlign: "center" }}>{fetchedRequest?.type}</Text>
                                            <Text style={{ fontFamily: "lexendMedium", fontSize: 14, color: "grey", marginBottom: 10, margin: 5, textAlign: "center" }}>{fetchedRequest?.details || "No details"}</Text>
                                            <Text style={{ fontFamily: 'lexendLight', fontSize: 12, color: "grey", marginBottom: 10 }}>{fetchedRequest?.updatedAt?.fulldate}</Text>
                                        </View>
                                        <View>
                                            <TouchableOpacity onPress={() => setShowEachRequestModal(false)} style={{ backgroundColor: AppColor.Blue, height: 45, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 15 }}>
                                                <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                </View>
                            ) : (
                                fetchedRequest?.request_user_data !== null ? (
                                    <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

                                        <View style={{}}>
                                            <View style={{ height: 70, width: 70, borderTopLeftRadius: 50, borderTopRightRadius: 50, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, backgroundColor: `${RenderStatusAlt(fetchedRequest?.status)}`, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                                                <Ionicons name="md-finger-print" size={30} color="#eee" />
                                            </View>
                                            <View style={{ alignItems: "center", marginTop: 15 }}>
                                                <Text style={{ fontFamily: 'lexendBold', fontSize: 16, marginBottom: 10 }}>{fetchedRequest?.request_user_data?.firstname + (fetchedRequest?.request_user_data?.middlename ? " " + fetchedRequest?.request_user_data?.middlename + " " : " ") + fetchedRequest?.request_user_data?.lastname}</Text>
                                                <Text style={{ fontFamily: "lexendMedium", fontSize: 14, marginBottom: 5, margin: 5, textAlign: "center" }}>{fetchedRequest?.type}</Text>
                                                <Text style={{ fontFamily: "lexendMedium", fontSize: 14, color: "grey", marginBottom: 10, margin: 5, textAlign: "center" }}>{fetchedRequest?.details || "No details"}</Text>
                                                <Text style={{ fontFamily: 'lexendLight', fontSize: 12, color: "grey", marginBottom: 10 }}>{fetchedRequest?.updatedAt?.fulldate}</Text>
                                            </View>
                                            <View>
                                                <TouchableOpacity onPress={() => setShowEachRequestModal(false)} style={{ backgroundColor: AppColor.Blue, height: 45, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 15 }}>
                                                    <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                    </View>
                                ) : (
                                    <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

                                        <View style={{}}>
                                            <View style={{ height: 70, width: 70, borderTopLeftRadius: 50, borderTopRightRadius: 50, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                                                <Ionicons name="md-finger-print" size={30} color="black" />
                                            </View>
                                            <View style={{ alignItems: "center", marginTop: 15 }}>
                                                <Text style={{ fontFamily: 'lexendBold', fontSize: 15, color: "red", marginBottom: 10 }}>Request not found</Text>
                                            </View>
                                            <View>
                                                <TouchableOpacity onPress={() => setShowEachRequestModal(false)} style={{ backgroundColor: AppColor.Blue, height: 45, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 15 }}>
                                                    <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                    </View>
                                )
                            )
                        )
                    )
                }
            </Modal>
        )
    };

    const renderTransactionHistory = ({ item }) => {
		return (
			<TouchableOpacity onPress={() => {
				setActiveTransactionID(item?.unique_id);
				setShowEachTransactionModal(true); 
			}} 
            onLongPress={() => { item?.transaction_status === "Processing" ? item?.type === "Deposit" ? CancelDeposit(item?.unique_id, item?.amount) : (item?.type === "Withdrawal" ? CancelWithdrawal(item?.unique_id, item?.amount) : null) : null}}
            style={{ marginBottom: 25, backgroundColor: "#fff", padding: 15, borderRadius: 8, }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ padding: 10, backgroundColor: AppColor.LightGrey, height: 50, width: 50, borderRadius: 8, justifyContent: "center", alignItems: "center" }}>
                        <View>
                            <MaterialCommunityIcons name={showTransactionIconAndColour(item?.type).icon} size={25} color={showTransactionIconAndColour(item?.type).color} />
                        </View>
                    </View>
                    <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={{ fontFamily: "lexendBold" }}>{item?.type}</Text>
                        <Text style={{ fontFamily: "lexendLight", fontSize: 13, color: "grey" }}>{item?.payment_method}</Text>
                        <Text style={{ fontFamily: "lexendLight", fontSize: 10, color: `${showTransactionStatusColor(item?.transaction_status).color}` }}>{item?.transaction_status}</Text>
                    </View>
                    <View style={{  }}>
                        <Text style={{ fontFamily: "lexendMedium", color: `${showTransactionIconAndColour(item?.type).color}`, fontSize: 16, textAlign: "right" }}>{showTransactionIconAndColour(item?.type).symbol} {"\u20A6"}{""}{digit_filter(item?.amount ? item?.amount : 0)}</Text>
                        <Text style={{ fontFamily: "lexendLight", color: "grey", fontSize: 11, textAlign: "right" }}>{item?.updatedAt?.date}</Text>
                </View>
                    </View>
			</TouchableOpacity>
		)
	};

    const renderPaymentRequests = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                setActiveRequestID(item?.unique_id);
                setShowEachRequestModal(true);
            }} style={{ marginBottom: 25, backgroundColor: "#fff", padding: 15, borderRadius: 8, }}>
                {
                    item?.platform_data !== null ? (
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <View>
                                <Image source={{ uri: item?.platform_data?.photo || passcoder_icon }} style={{ height: 50, width: 50, borderRadius: 8 }} />
                            </View>
                            <View style={{ marginLeft: 10, marginRight: 10, flex: 1 }}>
                                <Text style={{ fontFamily: "lexendBold" }}>{item?.platform_data?.name}</Text>
                                <Text style={{ fontFamily: "lexendBold", color: "grey" }}>{item?.details}</Text>
                                <Text style={{ fontFamily: "lexendLight", color: "grey", fontSize: 13 }}>{item?.updatedAt?.fulldate}</Text>
                            </View>
                            <View>
                                <RenderStatus status={item?.status} />
                            </View>
                        </View>
                    ) : (
                        item?.partner_data !== null ? (
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <View>
                                    <Image source={{ uri: item?.partner_data?.photo || passcoder_icon }} style={{ height: 50, width: 50, borderRadius: 8 }} />
                                </View>
                                    <View style={{ marginLeft: 10, marginRight: 10, flex: 1 }}>
                                    <Text style={{ fontFamily: "lexendBold" }}>{item?.partner_data?.name + ", " + item?.partner_data?.city}</Text>
                                    <Text style={{ fontFamily: "lexendBold", color: "grey", fontSize: 12 }}>{item?.details}</Text>
                                    <Text style={{ fontFamily: "lexendLight", color: "grey", fontSize: 13 }}>{item?.updatedAt?.fulldate}</Text>
                                </View>
                                <View>
                                    <RenderStatus status={item?.status} />
                                </View>
                            </View>
                        ) : (
                            item?.request_user_data !== null ? (
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <View>
                                        <Image source={{ uri: item?.request_user_data?.photo || passcoder_icon }} style={{ height: 50, width: 50, borderRadius: 8 }} />
                                    </View>
                                    <View style={{ marginLeft: 10, marginRight: 10, flex: 1 }}>
                                        <Text style={{ fontFamily: "lexendBold" }}>{item?.request_user_data?.firstname + (item?.request_user_data?.middlename ? " " + item?.request_user_data?.middlename + " " : " ") + item?.request_user_data?.lastname}</Text>
                                                <Text style={{ fontFamily: "lexendBold", color: "grey" }}>{item?.details}</Text>
                                        <Text style={{ fontFamily: "lexendLight", color: "grey", fontSize: 13 }}>{item?.updatedAt?.fulldate}</Text>
                                    </View>
                                    <View>
                                        <RenderStatus status={item?.status} />
                                    </View>
                                </View>
                            ) : (
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <View style={{ marginLeft: 5, marginRight: 5, flex: 1 }}>
                                        <Text style={{ fontFamily: "lexendMedium", fontSize: 16, color: "red" }}>Request not found</Text>
                                    </View>
                                </View>
                            )
                        )
                    )
                }
            </TouchableOpacity>
        )
    };

    const renderPendingPaymentRequests = ({ item }) => {
        return (
            <TouchableOpacity style={{ marginBottom: 25, backgroundColor: "#fff", padding: 15, borderRadius: 8, }}>
                {
                    item?.platform_data !== null ? (
                        <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <View>
                                <Image source={{ uri: item?.platform_data?.photo || passcoder_icon }} style={{ height: 50, width: 50, borderRadius: 8 }} />
                            </View>
                            <View style={{ marginLeft: 10, flex: 1 }}>
                                <Text style={{ fontFamily: "lexendBold" }}>{item?.platform_data?.name}</Text>
                                <Text style={{ fontFamily: "lexendBold", color: "grey" }}>{item?.type}</Text>
                                <Text style={{ fontFamily: "lexendBold", color: "grey", fontSize: 10, marginBottom: 5 }}>{item?.details || "No details"}</Text>
                                <Text style={{ fontFamily: "lexendLight", color: "grey", fontSize: 13 }}>{item?.updatedAt?.fulldate}</Text>
                            </View>
                            <View>
                                <RenderStatus status={item?.status} />
                            </View>
                        </TouchableOpacity>
                    ) : (
                        item?.partner_data !== null ? (
                            <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <View>
                                    <Image source={{ uri: item?.partner_data?.photo || passcoder_icon }} style={{ height: 50, width: 50, borderRadius: 8 }} />
                                </View>
                                <View style={{ marginLeft: 10, flex: 1 }}>
                                    <Text style={{ fontFamily: "lexendBold" }}>{item?.details}</Text>
                                    <Text style={{ fontFamily: "lexendBold", color: "grey", fontSize: 12 }}>{item?.type}</Text>
                                    {
                                        item?.details ?
                                            <Text style={{ fontFamily: "lexendBold", color: "grey", fontSize: 10, marginBottom: 5 }}>{item?.partner_data?.name + ", " + item?.partner_data?.city}</Text> :
                                            ""
                                    }
                                    <Text style={{ fontFamily: "lexendLight", color: "grey", fontSize: 13 }}>{item?.updatedAt?.fulldate}</Text>
                                </View>
                                <View>
                                    <RenderStatus status={item?.status} />
                                </View>
                            </TouchableOpacity>
                        ) : (
                            item?.request_user_data !== null ? (
                                <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <View>
                                        <Image source={{ uri: item?.request_user_data?.photo || passcoder_icon }} style={{ height: 50, width: 50, borderRadius: 8 }} />
                                    </View>
                                    <View style={{ marginLeft: 10, flex: 1 }}>
                                        <Text style={{ fontFamily: "lexendBold" }}>{item?.request_user_data?.firstname + (item?.request_user_data?.middlename ? " " + item?.request_user_data?.middlename + " " : " ") + item?.request_user_data?.lastname}</Text>
                                        <Text style={{ fontFamily: "lexendBold", color: "grey" }}>{item?.type}</Text>
                                        <Text style={{ fontFamily: "lexendBold", color: "grey", fontSize: 10, marginBottom: 5 }}>{item?.details || "No details"}</Text>
                                        <Text style={{ fontFamily: "lexendLight", color: "grey", fontSize: 13 }}>{item?.updatedAt?.fulldate}</Text>
                                    </View>
                                    <View>
                                        <RenderStatus status={item?.status} />
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <View style={{ marginLeft: 5, marginRight: 5, flex: 1 }}>
                                        <Text style={{ fontFamily: "lexendMedium", fontSize: 16, color: "red" }}>Request not found</Text>
                                    </View>
                                </View>
                            )
                        )
                    )
                }

                <View style={{ flexDirection: 'row', justifyContent: "space-between", marginTop: 15 }}>
                    <TouchableOpacity onPress={() => {
                        nav.navigate("AuthorizePayment", {
                            uniqueID: item?.unique_id,
                            amount: item?.amount,
                            passUser: passUser
                        }); setRequestUniqueID(item?.unique_id); setRequestPaymentAmount(item?.amount); }} disabled={acceptLoading || declineLoading} style={{ backgroundColor: `${acceptLoading || declineLoading ? "grey" : AppColor.Blue}`, padding: 12, flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 8 }}>
                        {acceptLoading || declineLoading ? (
                            <ActivityIndicator color={"#fff"} size={'small'} />
                        ) : (
                            <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Pay</Text>
                        )}
                    </TouchableOpacity>
                    <View style={{ width: 20 }} />
                    <TouchableOpacity onPress={() => Decline(item?.unique_id)} disabled={acceptLoading || declineLoading} style={{ backgroundColor: `${declineLoading ? "grey" : null}`, padding: 12, flex: 1, borderWidth: 1.5, borderColor: AppColor.Blue, borderRadius: 8, justifyContent: "center", alignItems: "center" }}>
                        {acceptLoading || declineLoading ? (
                            <ActivityIndicator color={AppColor.Blue} size={'small'} />
                        ) : (
                            <Text style={{ color: AppColor.Blue, fontFamily: "lexendBold" }}>Decline</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    };

    return (
        <>
            <ChooseFundMethodModal />
            <EnterAmountModal />
            <ConfirmPaymentModal />
            <RenderEachTransaction />
            <BankAccountAndChargeModal />
            <RenderEachRequest />
            <ConfirmWithdrawalPaymentModal />
            <EnterWithdrawAmountModal />
            <EnterWalletPinModal />
            <CardDepositStatusModal />
            <WithdrawalPaymentStatusModal />
            <AuthorizePaymentModal />
            <RequestPaymentStatusModal />
            <ChooseSendOptionModal />
            <SendPaymentPIDModal />
            <SendPaymentAmountModal />
            <SendPaymentWalletPinModal />
            <SendPaymentStatusModal />
            <BankAccountModal />
            <View style={{ flex: 1, backgroundColor: "#eee" }}>
                <Paystack
                    paystackKey={paystackConfig?.paystackKey}
                    amount={paystackConfig?.amount}
                    billingName={paystackConfig?.billingName}
                    billingEmail={paystackConfig?.billingEmail}
                    billingMobile={paystackConfig?.billingMobile}
                    refNumber={paystackConfig?.refNumber}
                    channels={paystackConfig?.channels}
                    onCancel={(e) => {
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: "Deposit cancelled!"
                        });
                        setFundMethod(null);
                    }}
                    onSuccess={(res) => {
                        onPaystackSuccess(res);
                    }}
                    ref={paystackWebViewRef}
                />
                <View style={styles.walletTop}>
                    <Image source={require("../../assets/img/wallet_vector.png")} resizeMode='contain' style={{ position: "absolute", height: 270, width: Dimensions.get('screen').width }} />
                    <View style={{ marginTop: 50, margin: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Ionicons name="arrow-back-sharp" size={24} color="#fff" onPress={() => nav.goBack()} />
                        <Text style={{ fontFamily: "lexendBold", color: "#fff", fontSize: 18 }}>Wallet</Text>
                        <View style={{ width: 10 }} />
                    </View>

                    <View style={{ margin: 15, flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
                        <View>
                            <Text style={{ fontFamily: "lexendLight", color: "#fff" }}>Active Balance</Text>
                            {
                                loading ? 
                                    <ActivityIndicator color={AppColor.White} size={'small'} style={{ marginTop: 5 }} /> :
                                    <Text style={{ fontFamily: "lexendMedium", color: "#fff", fontSize: 23 }}><Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{passUser?.balance}</Text>
                            }
                        </View>
                        <View>
                            <TouchableOpacity style={{ height: 40, width: 40, justifyContent: "center", alignItems: "center", borderRadius: 5, backgroundColor: "#544fa5" }} disabled={loading} onPress={() => getCurrentUser()}>
                                {
                                    loading ? 
                                        <ActivityIndicator color={AppColor.White} size={'small'} /> : 
                                        <MaterialCommunityIcons name="refresh" size={24} color="#fff" />
                                }
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: "space-evenly", marginTop: 15 }}>
                        <TouchableOpacity 
                            onPress={() => checkForFundingStatus()}
                            style={{ height: 45, width: 100, justifyContent: "center", alignItems: "center", borderRadius: 5, borderWidth: 1.3, borderColor: "#fff" }} >
                            <Text style={{ fontFamily: "lexendMedium", color: "#fff" }}>Deposit</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity
                            onPress={() => checkForWithdrawalStatus()} 
                            // disabled={passUser ? (!passUser.account_name || !passUser.account_number || !passUser.bank ? true : false) : false}
                            style={{ height: 35, width: 80, justifyContent: "center", alignItems: "center", backgroundColor: `#fff`, borderRadius: 5 }}>
                            <Text style={{ fontFamily: "lexendMedium", color: AppColor.Blue }}>Withdraw</Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity 
                            onPress={() => checkForSendingStatus()}
                            style={{ height: 45, width: 100, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", borderRadius: 5, borderWidth: 1.3, borderColor: "#fff" }} >
                            <Text style={{ fontFamily: "lexendMedium", color: AppColor.Blue }}>Transfer</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View>
                    <View style={{ marginLeft: 15, marginRight: 15, marginTop: 10, flexDirection: "row", alignItems: 'center' }}>
                        {UserChoice.map((choice, index) => (
                            <TouchableOpacity
                                onPress={() => { setUserChoice(choice.title); switchTab(choice.title); }}
                                key={index}
                                style={{ marginRight: 25 }}>
                                <Text style={{ fontSize: choice.title === activeChoice ? 20 : 10, fontFamily: "lexendMedium", borderBottomWidth: choice.title === activeChoice ? 3 : null, borderBottomColor: choice.title === activeChoice ? AppColor.Blue : "grey", borderRadius: 1 }}>{choice.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {
                        activeChoice === "Transactions" ? 
                            transactionHistoryLoading ? (
                                <View style={{ flex: 1, marginTop: (Dimensions.get("window").height * 20) / 100, justifyContent: "center", alignItems: "center" }}>
                                    <ActivityIndicator color={AppColor.Blue} size={'large'} />
                                </View>
                                ) : (
                                <>
                                    <View style={{ margin: 15 }}>
                                        {transactionHistory.length === 0 && <View style={{ justifyContent: "center", alignItems: "center", marginTop: 30 }}>
                                            <Text style={{ fontFamily: "lexendBold" }}>No transactions!</Text>
                                        </View>}
                                        <FlatList
                                            refreshing={refreshingTransactionHistory}
                                            refreshControl={
                                                <RefreshControl refreshing={refreshingTransactionHistory} onRefresh={onRefreshTransactionHistory} />
                                            }
                                            contentContainerStyle={{ paddingBottom: 400 }}
                                            showsVerticalScrollIndicator={false}
                                            data={transactionHistory}
                                            keyExtractor={item => `${item.unique_id}`}
                                            renderItem={renderTransactionHistory}
                                        />
                                    </View>
                                </>
                            ) : 
                            activeChoice === "Requests" ? 
                                pendingRequestsLoading ? (
                                    <View style={{ flex: 1, marginTop: (Dimensions.get("window").height * 20) / 100, justifyContent: "center", alignItems: "center" }}>
                                        <ActivityIndicator color={AppColor.Blue} size={'large'} />
                                    </View>
                                ) : (
                                    <>
                                        <View style={{ margin: 15 }}>
                                            {pendingRequests.length === 0 && <View style={{ justifyContent: "center", alignItems: "center", marginTop: 30 }}>
                                                <Text style={{ fontFamily: "lexendBold" }}>No pending requests!</Text>
                                            </View>}
                                            <FlatList
                                                refreshing={refreshingPendingPaymentRequests}
                                                refreshControl={
                                                    <RefreshControl refreshing={refreshingPendingPaymentRequests} onRefresh={onRefreshPendingPaymentRequests} />
                                                }
                                                contentContainerStyle={{ paddingBottom: 400 }}
                                                showsVerticalScrollIndicator={false}
                                                data={pendingRequests}
                                                keyExtractor={item => `${item.unique_id}`}
                                                renderItem={renderPendingPaymentRequests}
                                            />
                                        </View>
                                    </>
                                ) : 
                                allRequestsLoading ? (
                                    <View style={{ flex: 1, marginTop: (Dimensions.get("window").height * 20) / 100, justifyContent: "center", alignItems: "center" }}>
                                        <ActivityIndicator color={AppColor.Blue} size={'large'} />
                                    </View>
                                ) : (
                                    <>
                                        <View style={{ margin: 15 }}>
                                            {allRequests.length === 0 && <View style={{ justifyContent: "center", alignItems: "center", marginTop: 30 }}>
                                                <Text style={{ fontFamily: "lexendBold" }}>No requests!</Text>
                                            </View>}
                                            <FlatList
                                                refreshing={refreshingPaymentRequests}
                                                refreshControl={
                                                    <RefreshControl refreshing={refreshingPaymentRequests} onRefresh={onRefreshPaymentRequests} />
                                                }
                                                contentContainerStyle={{ paddingBottom: 400 }}
                                                showsVerticalScrollIndicator={false}
                                                data={allRequests}
                                                keyExtractor={item => `${item.unique_id}`}
                                                renderItem={renderPaymentRequests}
                                            />
                                        </View>
                                    </>
                                )
                    }
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    walletTop: {
        height: 270,
        width: Dimensions.get('screen').width,
        backgroundColor: AppColor.Blue
    },
    textInput: {
        backgroundColor: '#eee',
        height: 50,
        paddingLeft: 20,
        fontFamily: "lexendMedium",
        marginTop: 10,
        borderRadius: 8
    }
})