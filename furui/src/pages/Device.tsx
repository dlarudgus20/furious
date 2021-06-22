import { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Grid,
  CircularProgress, IconButton, TextField, Typography, Button
} from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { Edit as EditIcon, Check, Clear, ExpandMore } from '@material-ui/icons'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import axios from 'axios'
import { DeviceInfo } from 'furitype'
import Paragraph from '../components/Paragraph'
import OnlineStatus from '../components/OnlineStatus'
import SensorList from '../components/SensorList'
import ControlList from '../components/ControlList'

const useStyles = makeStyles(theme => createStyles({
  paragraph: {
    margin: theme.spacing(6),
  },
  item: {
    marginBottom: theme.spacing(3),
  },
  divider: {
    width: '100%',
    marginBottom: theme.spacing(3),
  },
}))

function DevicePage() {
  const classes = useStyles()
  const history = useHistory()
  const params = useParams<{ id?: string }>()

  const [info, setInfo] = useState<DeviceInfo | null>(null)
  const [newName, setNewName] = useState('')
  const [editName, setEditName] = useState(false)
  const [applying, setApplying] = useState(false)

  const [openSecret, setOpenSecret] = useState(false)
  const [secret, setSecret] = useState<string | null>(null)

  const id = params.id && parseInt(params.id)

  useEffect(() => {
    async function retrieve() {
      const info = (await axios.get(`/api/front/dev/info/${id}`)).data as DeviceInfo
      setInfo(info)
      setNewName(info.name)
    }

    if (id) {
      retrieve()
    }

    const timeout = setInterval(() => retrieve(), 4000)
    return () => clearInterval(timeout)
  }, [id])

  function startEdit() {
    setEditName(true)
  }

  function cancelEdit() {
    setNewName(info?.name || '')
    setEditName(false)
  }

  function applyEdit() {
    async function retrieve() {
      setApplying(true)
      try {
        await axios.post(`/api/front/dev/changeName/${id}`, { name: newName })
        if (info) {
          info.name = newName
          setInfo(info)
          setEditName(false)
        }
      } catch (err) {
        alert('Duplicated Device Name')
      } finally {
        setApplying(false)
      }
    }

    if (newName === '') {
      alert('Name is empty')
    } else {
      retrieve()
    }
  }

  useEffect(() => {
    async function retrieve() {
      const { secret } = (await axios.get(`/api/front/dev/secret/${id}`)).data as { secret: string }
      if (openSecret) {
        setSecret(secret)
      }
    }

    if (id && openSecret && secret === null) {
      retrieve()
    }
  }, [id, openSecret, secret])

  if (!id) {
    history.replace('/404')
    return <></>
  }

  if (!info) {
    return <Typography>Loading...</Typography>
  }

  return (
    <div>
      <Paragraph className={classes.paragraph} title={`Device Info: ${info.name}`}>
        <Box className={classes.item} display='flex' alignItems='center' flexDirection='row'>
          <Typography style={{ marginRight: 8 }}>Device ID: </Typography>
          <TextField
            value={info.id}
            type='text'
            disabled
          />
        </Box>
        <Box className={classes.item} display='flex' alignItems='center' flexDirection='row'>
          <Typography style={{ marginRight: 8 }}>Name: </Typography>
          <TextField
            value={newName}
            type='text'
            disabled={!editName || applying}
            onChange={e => setNewName(e.target.value)}
            InputProps={{
              endAdornment:
                editName ? (
                  <>
                    <IconButton disabled={applying} onClick={cancelEdit}>
                      <Clear />
                    </IconButton>
                    <IconButton disabled={applying} onClick={applyEdit}>
                      <Check />
                    </IconButton>
                  </>
                ) : (
                  <IconButton disabled={applying} onClick={startEdit}>
                    <EditIcon />
                  </IconButton>
                )
            }}
          />
        </Box>
        <OnlineStatus
          className={classes.item}
          value={info.isOnline}
          positiveLabel='Device is online now'
          negativeLabel='Device is offline now'
        />
        <Accordion expanded={openSecret} onChange={() => setOpenSecret(!openSecret)}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>View Device Secret</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {(openSecret && secret) ? (
              <Grid container justify='space-between'>
                <Grid item>
                  <TextField
                    className={classes.item}
                    label='Device Secret'
                    value={secret}
                    type='text'
                    multiline
                    disabled
                  />
                </Grid>
                <Grid item style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-end' }}>
                  <Box display='flex' flexDirection='row' alignItems='center'>
                    <CopyToClipboard text={secret} onCopy={() => alert('Secret Copied')}>
                      <Button variant='contained' color='primary'>Copy to Clipboard</Button>
                    </CopyToClipboard>
                    <Button
                      style={{ marginLeft: '0.5rem' }}
                      variant='contained'
                      color='secondary'
                      onClick={() => {
                        setOpenSecret(false)
                        setSecret(null)
                      }}
                    >
                      Clear
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <CircularProgress />
            )}
          </AccordionDetails>
        </Accordion>
      </Paragraph>
      <SensorList className={classes.paragraph} deviceInfo={info} />
      <ControlList className={classes.paragraph} deviceInfo={info} />
    </div>
  )
}

export default DevicePage
