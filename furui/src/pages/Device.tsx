import { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Grid,
  CircularProgress, IconButton, TextField, Typography, Button
} from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { Edit as EditIcon, Check, Clear, ExpandMore } from '@material-ui/icons'
import axios from 'axios'
import { DeviceInfo } from '../types/Device'
import Paragraph from '../components/Paragraph'

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
      <Paragraph className={classes.paragraph} title='Device Info'>
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
        <Accordion expanded={openSecret} onChange={() => setOpenSecret(!openSecret)}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>View Device Secret</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {openSecret ? (
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
                  <Button
                    variant='contained'
                    color='secondary'
                    onClick={() => {
                      setOpenSecret(false)
                      setSecret(null)
                    }}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <CircularProgress />
            )}
          </AccordionDetails>
        </Accordion>
      </Paragraph>
      <Paragraph className={classes.paragraph} title='Sensors'>
      </Paragraph>
      <Paragraph className={classes.paragraph} title='Scripts'>
      </Paragraph>
    </div>
  )
}

export default DevicePage
