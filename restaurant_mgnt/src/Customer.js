import { useState, useEffect } from 'react'
import { Button, Modal } from 'react-bootstrap'
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Select from 'react-select'
import { format } from 'date-fns'
import { BsPlus, BsTrash, BsPencil } from "react-icons/bs";
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

export default function Customer() {
    const [slot, setSlot] = useState()
    const [records, setRecords] = useState([])
    const { register, handleSubmit } = useForm()
    const [showForm, setShowForm] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [tempData, setTempData] = useState({
        id: null,
        name: '',
        phone: '',
        email: '',
        tableID: '', //no need modify
        slot: slots[0],
        dateTime: '' //no need modify
    })


    const customerRef = firestore.collection('customer')
    const query = customerRef.orderBy('dateTime');
    const [data] = useCollectionData(query, { idField: 'id' });

    useEffect(() => {
        if (data) { // Guard condition
            let r = data.map((d, i) => {
                // console.log('useEffect', format(d.createdAt.toDate(), "yyyy-MM-dd"))
                return (
                    <CustRow
                        data={d}
                        i={i}
                        onDeleteClick={handleDeleteClick}
                        onEditClick={handleEditClick}
                    />
                )
            })

            setRecords(r)
        }
    },
        [data])

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
            tableID: '',
            slot: slots[0],
            dateTime: ''
        })
        setShowForm(false)
        setEditMode(false)

    }

    const onSubmit = async (data) => {
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


        if (editMode) {
            // Update record
            console.log("UPDATING!!!!", data.id)
            await customerRef.doc(data.id)
                .set(preparedData)
                .then(() => console.log("customerRef has been set"))
                .catch((error) => {
                    console.error("Error: ", error);
                    alert(error)
                });
        } else {

            await customerRef
                .add(preparedData)
                .then(() => console.log("New record has been added."))
                .catch((error) => {
                    console.error("Errror:", error)
                    alert(error)
                })
            // setShowForm(false)
        }
        handleCloseForm()
    }

    const handleDeleteClick = (id) => {
        console.log('handleDeleteClick in Journal', id)
        if (window.confirm("Are you sure to delete this record?"))
            customerRef.doc(id).delete()
    }

    const handleEditClick = (data) => {
        let preparedData = {
            id: data.id,
            name: data.name,
            phone: data.phone,
            email: data.email,
            tableID: data.tableID,
            slot: slot,
            dateTime: data.dateTime
        }
        console.log("handleEditClick", preparedData)
        // expect original data type for data.createdAt is Firebase's timestamp
        // convert to JS Date object and put it to the same field
        // if ('toDate' in data.createdAt) // guard, check wther toDate() is available in createdAt object.
        //   data.createdAt = data.createdAt.toDate()

        setTempData(preparedData)
        setSlot(data.slot)
        setShowForm(true)
        setEditMode(true)
    }


    return (
        <Container>
            <Row>
                <Col>
                    <h1>Customer Information</h1>
                    <Button variant="outline-dark" onClick={handleshowForm}>
                        <BsPlus /> Add
                    </Button>
                </Col>
            </Row>

            <Table striped bordered hover variant="dark">
                <thead>
                    <tr>
                        <th>/</th>
                        <th>Date</th>
                        <th>Table Number</th>
                        <th>Name</th>
                        <th>Phone Number</th>
                        <th>Email</th>
                        <th>Time Slot</th>

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
                            Customer Info
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <Row>
                            <Col>
                                <label htmlFor="datetime">Date</label>
                            </Col>
                            <Col>
                                <input
                                    type="text"
                                    placeholder="dateTime"
                                    ref={register}
                                    name="dateTime"
                                    id="dateTime"
                                    defaultValue={tempData.dateTime}
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <label htmlFor="tableID">Table Number</label>
                            </Col>
                            <Col>
                                <input
                                    type="text"
                                    placeholder="tableID"
                                    ref={register}
                                    name="tableID"
                                    id="tableID"
                                    defaultValue={tempData.tableID}
                                />
                            </Col>
                        </Row>
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
                                    defaultValue={tempData.name}
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
                                    defaultValue={tempData.phone}
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
                                    defaultValue={tempData.email}
                                />
                            </Col>
                        </Row>


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

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseForm}>
                            Close
                        </Button>
                        <Button variant="primary" type="submit">
                            Add
                        </Button>
                    </Modal.Footer>

                </form>

            </Modal>
        </Container>
    )
}

function CustRow(props) {
    let d = props.data
    let i = props.i
    return (
        <tr>
            <td>
                <BsTrash onClick={() => props.onDeleteClick(d.id)} />
                <BsPencil onClick={() => props.onEditClick(d)} />
            </td>
            <td>{d.dateTime}</td>
            <td>{d.tableID}</td>
            <td>{d.name}</td>
            <td>{d.phone}</td>
            <td>{d.email}</td>
            <td>{d.slot.timeSlot}</td>

        </tr>
    )
}