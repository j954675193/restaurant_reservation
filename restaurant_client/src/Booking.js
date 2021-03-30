import { useState, useEffect } from 'react'
import { Button, Modal } from 'react-bootstrap'
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Select from 'react-select'
import { BiAlarm } from "react-icons/bi";
import { useForm } from "react-hook-form"

// Firebase
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

if (firebase.apps.length === 0) {
    firebase.initializeApp({
        apiKey: process.env.REACT_APP_API_KEY,
        authDomain: process.env.REACT_APP_AUTH_DOMAIN,
        databaseUrl: process.env.REACT_APP_DATABASE_URL,
        projectId: process.env.REACT_APP_PROJECT_ID,
        storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_APP_ID
    })
}
const firestore = firebase.firestore()
const auth = firebase.auth()

const slots = [
    { id: 1, timeSlot: 'lunch' },
    { id: 2, timeSlot: 'dinner' },
]

export default function Booking() {
    const [slot, setSlot] = useState()
    const [records, setRecords] = useState([])
    const { register, handleSubmit } = useForm()
    const [showForm, setShowForm] = useState(false)
    const [tempData, setTempData] = useState({
        id: null,
        name: '',
        phone: '',
        email: '',
        tableID: '1', //no need modify
        slot: slots[0],
        dateTime: { date: '0000-00-00', dateID: '0' } //no need modify
    })

    const deskRef = firestore.collection('desk');
    const query = deskRef.orderBy('dateTime.date');
    const [data] = useCollectionData(query, { idField: 'id' });

    const dateRef = firestore.collection('dateTable')
    const date_query = dateRef.orderBy('dateID')
    const [date_data] = useCollectionData(date_query, { idField: 'id' });
    const date = date_data

    const customerRef = firestore.collection('customer')


    useEffect(() => {
        if (data) { // Guard condition
            let r = data.map((d, i) => {
                return (
                    <DeskRow
                        data={d}
                        i={i}
                        onBookClick={handleBookClick}
                    />
                )
            })
            setRecords(r)
        }
    },
        [data])

    const handleCategoryFilterChange = (obj) => {
        console.log('filter', obj)
        if (data) { // Guard condition      
            let filteredData = data.filter(d => d.dateTime.dateID == obj.dateID)
            let r = filteredData.map((d, i) => {
                console.log('filter', d)
                return (
                    <DeskRow data={d} i={i} onBookClick={handleBookClick} />
                )
            })

            setRecords(r)
        }
    }
    const handleSlotChange = (obj) => {
        console.log('handleSlotChange', obj)
        setSlot(obj)
    }

    const handleshowForm = () => setShowForm(true)

    const handleCloseForm = () => {
        setTempData({
            id: null,
            name: '',
            phone: '',
            email: '',
            tableID: '1',
            slot: slots[0],
            dateTime: { date: '0000-00-00', dateID: '0' }
        })
        setShowForm(false)

    }

    const onSubmit = async (data) => {

        // deskRef.doc(data.id).onSnapshot(doc => {
        //     console.log(doc.data().timeSlot)
        // })

        let preparedData = {
            // ...data,
            name: data.name,
            phone: data.phone,
            email: data.email,
            tableID: data.tableID,
            slot: slot,
            dateTime: data.dateTime
        }
        console.log('onSubmit', preparedData)

        if (preparedData.slot.timeSlot == 'dinner') {
            deskRef.doc(data.id).onSnapshot(doc => {
                console.log('dinner:', doc.data().timeSlot.dinner)
                if (doc.data().timeSlot.dinner == 'free') {
                    customerRef
                        .add(preparedData)
                        .then(() => window.alert("New record has been added!"))
                        .catch((error) => {
                            console.error("Errror:", error)
                            alert(error)
                        })

                    deskRef.doc(data.id).update({ timeSlot: { dinner: 'booked', lunch: doc.data().timeSlot.lunch } })
                } else {
                    window.alert("This slot has been booked")
                }
            })
        } else {
            deskRef.doc(data.id).onSnapshot(doc => {
                console.log('lunch:', doc.data().timeSlot.lunch)
                if (doc.data().timeSlot.lunch == 'free') {
                    customerRef
                        .add(preparedData)
                        .then(() => window.alert("New record has been added!"))
                        .catch((error) => {
                            console.error("Errror:", error)
                            alert(error)
                        })

                    deskRef.doc(data.id).update({ timeSlot: { lunch: 'booked', dinner: doc.data().timeSlot.dinner } })
                } else {
                    window.alert("This slot has been booked")
                }
            })
        }

        handleCloseForm()

    }

    const handleBookClick = (data) => {
        let preparedData = {
            id: data.id,
            name: '',
            phone: '',
            email: '',
            tableID: data.tableID,
            slot: slot,
            dateTime: data.dateTime
        }
        // console.log("handleBookClick", preparedData)

        setTempData(preparedData)
        setSlot(data.slot)
        setShowForm(true)

    }

    return (
        <Container>
            <Row>
                <Col>
                    <h1>Reservation</h1>

                </Col>

                <Col>
                    date:
                    <Select
                        options={date}
                        getOptionLabel={x => x.date}
                        getOptionValue={x => x.dateID}
                        onChange={handleCategoryFilterChange}
                    />
                </Col>
            </Row>
            <Table striped bordered hover variant="dark">
                <thead>
                    <tr>
                        <th>Reserve</th>
                        <th>Date</th>
                        <th>Table Number</th>
                        <th>Party Size</th>
                        <th>Status(lunch)</th>
                        <th>Status(dinner)</th>

                    </tr>
                </thead>
                <tbody>
                    {records}
                </tbody>

            </Table>

            <Modal
                show={showForm} onHide={handleCloseForm}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input
                        type="hidden"
                        placeholder="ID"
                        ref={register}
                        name="id"
                        id="id"
                        defaultValue={tempData.id}
                    />
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Booking
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col>
                                <label htmlFor="name">Name</label>
                            </Col>
                            <Col>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    ref={register({ required: true })}
                                    name="name"
                                    id="name"
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <label htmlFor="phone">Phone Number</label>
                            </Col>
                            <Col>
                                <input
                                    type="text"
                                    placeholder="Phone Number"
                                    ref={register({ required: true })}
                                    name="phone"
                                    id="phone"
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <label htmlFor="email">Email</label>
                            </Col>
                            <Col>
                                <input
                                    type="text"
                                    placeholder="Email"
                                    ref={register({ required: true })}
                                    name="email"
                                    id="email"
                                // defaultValue={tempData.description}
                                />
                            </Col>
                        </Row>

                        <input
                            type="hidden"
                            placeholder="tableID"
                            ref={register}
                            name="tableID"
                            id="tableID"
                            defaultValue={tempData.tableID}
                        />

                        <Row>
                            <Col>
                                <label htmlFor="slot">Slot</label>
                            </Col>
                            <Col>
                                <Select
                                    id="slot"
                                    name="slot"
                                    value={slot}
                                    placeholder="Slot"
                                    options={slots}
                                    onChange={handleSlotChange}
                                    getOptionLabel={x => x.timeSlot}
                                    getOptionValue={x => x.id}
                                />
                            </Col>
                        </Row>

                        <input
                            type="hidden"
                            placeholder="dateTime"
                            ref={register}
                            name="dateTime"
                            id="dateTime"
                            defaultValue={tempData.dateTime.date}
                        />

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseForm}>
                            Close
                        </Button>
                        <Button variant="primary" type="submit">
                            Book
                        </Button>
                    </Modal.Footer>

                </form>

            </Modal>
        </Container>
    )
}

function DeskRow(props) {
    let d = props.data
    let i = props.i
    return (
        <tr>

            <td>
                <BiAlarm onClick={() => props.onBookClick(d)} />
            </td>
            <td>{d.dateTime.date}</td>
            <td>{d.tableID}</td>
            <td>{d.size}</td>
            <td>{d.timeSlot.lunch}</td>
            <td>{d.timeSlot.dinner}</td>

        </tr>
    )
}