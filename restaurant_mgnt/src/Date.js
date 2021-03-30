import { useState, useEffect } from 'react'
import { Button, Modal } from 'react-bootstrap'
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
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

    const [records, setRecords] = useState([])
    const { register, handleSubmit } = useForm()
    const [showForm, setShowForm] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [tempData, setTempData] = useState({
        id: null,
        dateID: '',
        date: '0000-00-00',
    })

    const dateRef = firestore.collection('dateTable')
    const query = dateRef.orderBy('date')
    const [data] = useCollectionData(query, { idField: 'id' });

    useEffect(() => {
        if (data) { // Guard condition
            let r = data.map((d, i) => {
                return (
                    <DateRow
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


    // Handlers for Modal Add Form
    const handleshowForm = () => setShowForm(true)

    // Handlers for Modal Add Form
    const handleCloseForm = () => {
        setTempData({
            id: null,
            dateID: '',
            date: '0000-00-00',
        })

        setShowForm(false)
        setEditMode(false)

    }

    const onSubmit = async (data) => {
        let preparedData = {
            // ...data,
            dateID: data.dateID,
            date: data.date,
        }
        console.log('onSubmit', preparedData)

        if (editMode) {
            // Update record
            console.log("UPDATING!!!!", data.id)
            await dateRef.doc(data.id)
                .set(preparedData)
                .then(() => console.log("moneyRef has been set"))
                .catch((error) => {
                    console.error("Error: ", error);
                    alert(error)
                });
        } else {

            await dateRef
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

    const handleDeleteClick = async (id) => {
        console.log('handleDeleteClick in Journal', id)
        if (window.confirm("Are you sure to delete this record?"))
            dateRef.doc(id).delete()

    }

    const handleEditClick = (data) => {
        let preparedData = {
            id: data.id,
            dateID: data.dateID,
            date: data.date,
        }
        console.log("handleEditClick", preparedData)
        // expect original data type for data.createdAt is Firebase's timestamp
        // convert to JS Date object and put it to the same field
        // if ('toDate' in data.createdAt) // guard, check wther toDate() is available in createdAt object.
        //   data.createdAt = data.createdAt.toDate()

        setTempData(preparedData)
        setShowForm(true)
        setEditMode(true)
    }
    return (
        <Container>
            <h1>Date Management</h1>
            <Button variant="outline-dark" onClick={handleshowForm}>
                <BsPlus /> Add
      </Button>


            <Table striped bordered hover variant="dark">
                <thead>
                    <tr>
                        <th>/</th>
                        <th>ID</th>
                        <th>Date</th>
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
                            Add
            </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col>
                                <label htmlFor="dateID">ID</label>
                            </Col>
                            <Col>
                                <input
                                    type="text"
                                    step="any"
                                    // min="0"
                                    placeholder="ID"
                                    ref={register({ required: true })}
                                    name="dateID"
                                    id="dateID"
                                    defaultValue={tempData.dateID}
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <label htmlFor="date">Date</label>
                            </Col>
                            <Col>
                                <input
                                    type="text"
                                    placeholder="date"
                                    ref={register({ required: true })}
                                    name="date"
                                    id="date"
                                    defaultValue={tempData.date}
                                />
                            </Col>
                        </Row>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseForm}>
                            Close
          </Button>
                        <Button variant="primary" type="submit">
                            Add Record
            </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </Container>
    )
}

function DateRow(props) {
    let d = props.data
    let i = props.i
  
    return (
      <tr>
        <td>
          <BsTrash onClick={() => props.onDeleteClick(d.id)} />
          <BsPencil onClick={() => props.onEditClick(d)} />
        </td>
        <td>{d.dateID}</td>
        <td>{d.date}</td>
      </tr>
    )
  }