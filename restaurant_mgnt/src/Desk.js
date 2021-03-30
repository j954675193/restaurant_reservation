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


export default function Desk() {
    const [dateTime, setDateTime] = useState()
    const { register, handleSubmit } = useForm()
    const [showForm, setShowForm] = useState(false)
    const [records, setRecords] = useState([])
    const [editMode, setEditMode] = useState(false)
    const [tempData, setTempData] = useState({
        id: null,
        dateTime: { dateID: '0', date: '0000-00-00' },
        tableID: '',
        size: 0,
        timeSlot: { dinner: 'free', lunch: 'free' }
    })

    // Firebase stuff
    const deskRef = firestore.collection('desk');
    const query = deskRef.orderBy('dateTime.date');
    const [data] = useCollectionData(query, { idField: 'id' });

    const dateRef = firestore.collection('dateTable')
    const date_query = dateRef.orderBy('dateID')
    const [date_data] = useCollectionData(date_query, { idField: 'id' });
    const date = date_data

    console.log("REACT_APP_PROJECT_ID", process.env.REACT_APP_PROJECT_ID)

    useEffect(() => {
        if (data) { // Guard condition
            let r = data.map((d, i) => {
                // console.log('useEffect', format(d.createdAt.toDate(), "yyyy-MM-dd"))
                return (
                    <DeskRow
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


    const handleCategoryFilterChange = (obj) => {
        console.log('filter', obj)
        if (data) { // Guard condition      
            let filteredData = data.filter(d => d.dateTime.dateID == obj.dateID)
            let r = filteredData.map((d, i) => {
                console.log('filter', d)
                return (
                    <DeskRow data={d} i={i}
                        onDeleteClick={handleDeleteClick}
                        onEditClick={handleEditClick} />
                )
            })

            setRecords(r)
        }
    }


    const handleshowForm = () => setShowForm(true)

    const handleCloseForm = () => {
        setTempData({
            id: null,
            dateTime: { dateID: '0', date: '0000-00-00' },
            tableID: '',
            size: 0,
            timeSlot: { dinner: 'free', lunch: 'free' }
        })
        setDateTime({})
        setShowForm(false)
        setEditMode(false)
    }

    const onSubmit = async (data) => {
        let preparedData = {
            // description: data.description,
            // amount: parseFloat(data.amount),
            // createdAt: new Date(data.createdAt),
            // category: category
            dateTime: dateTime,
            tableID: data.tableID,
            size: data.size,
            timeSlot: {dinner:data.dinner,lunch:data.lunch}
        }
        console.log('onSubmit', preparedData)


        if (editMode) {
            console.log("UPDATING!!!!", data.id)
            await deskRef.doc(data.id)
                .set(preparedData)
                .then(() => console.log("moneyRef has been set"))
                .catch((error) => {
                    console.error("Error: ", error);
                    alert(error)
                });
        } else {

            await deskRef
                .add(preparedData)
                .then(() => console.log("New record has been added."))
                .catch((error) => {
                    console.error("Errror:", error)
                    alert(error)
                })

        }
        handleCloseForm()
    }

    const handleDateChange = (obj) => {
        console.log('handleDateChange', obj)
        setDateTime(obj)
    }

    const handleDeleteClick = (id) => {
        console.log('handleDeleteClick in Journal', id)
        if (window.confirm("Are you sure to delete this record?"))
            deskRef.doc(id).delete()
    }

    const handleEditClick = (data) => {
        let preparedData = {
            id: data.id,
            dateTime: dateTime,
            tableID: data.tableID,
            size: data.size,
            timeSlot: {dinner:data.timeSlot.dinner,lunch:data.timeSlot.lunch}
        }
        console.log("handleEditClick", preparedData)

        setTempData(preparedData)
        setDateTime(data.dateTime)
        setShowForm(true)
        setEditMode(true)
    }


    return (
        <Container>
            <Row>
                <Col>
                    <h1>Table Management</h1>
                    <Button variant="outline-dark" onClick={handleshowForm}>
                        <BsPlus /> Add
                    </Button>
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
                        <th>/</th>
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
                            {editMode ? "Edit Record" : "Add New Record"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <Row>
                            <Col>
                                <label htmlFor="dateTime">Date</label>
                            </Col>
                            <Col>
                                <Select
                                    id="dateTime"
                                    name="dateTime"
                                    value={dateTime}
                                    placeholder="Date"
                                    options={date}
                                    onChange={handleDateChange}
                                    getOptionLabel={x => x.date}
                                    getOptionValue={x => x.dateID}
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
                                    ref={register({ required: true })}
                                    name="tableID"
                                    id="tableID"
                                    defaultValue={tempData.tableID}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <label htmlFor="size">Party Size</label>
                            </Col>
                            <Col>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    placeholder="Size"
                                    ref={register({ required: true })}
                                    name="size"
                                    id="size"
                                    defaultValue={tempData.size}
                                />
                            </Col>

                        </Row>

                        <Row>
                            <Col>
                                <label htmlFor="lunch">Status(lunch)</label>
                            </Col>
                            <Col>
                                <input
                                    type="text"
                                    placeholder="lunch"
                                    ref={register({ required: true })}
                                    name="lunch"
                                    id="lunch"
                                    defaultValue={tempData.timeSlot.lunch}
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <label htmlFor="lunch">Status(dinner)</label>
                            </Col>
                            <Col>
                                <input
                                    type="text"
                                    placeholder="dinner"
                                    ref={register({ required: true })}
                                    name="dinner"
                                    id="dinner"
                                    defaultValue={tempData.timeSlot.dinner}
                                />
                            </Col>
                        </Row>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseForm}>
                            Close
                        </Button>

                        <Button variant={editMode ? "success" : "primary"} type="submit">
                            {editMode ? "Save Record" : "Add Record"}
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
    // console.log("JournalRow", d)
    return (
        <tr>
            <td>
                <BsTrash onClick={() => props.onDeleteClick(d.id)} />
                <BsPencil onClick={() => props.onEditClick(d)} />
            </td>
            <td>{d.dateTime.date}</td>
            <td>{d.tableID}</td>
            <td>{d.size}</td>
            <td>{d.timeSlot.lunch}</td>
            <td>{d.timeSlot.dinner}</td>
        </tr>
    )
}