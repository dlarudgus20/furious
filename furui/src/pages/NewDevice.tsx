import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Box, TextField, Typography } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import axios from 'axios'
import Paragraph from '../components/Paragraph'

const useStyles = makeStyles(theme => createStyles({
  root: {
    margin: theme.spacing(6),
  },
  item: {
    margin: theme.spacing(1),
  },
  submit: {
    marginTop: theme.spacing(2),
  },
}))

function NewDevicePage() {
  const classes = useStyles()
  const history = useHistory()

  const [name, setName] = useState('')

  async function create() {
    try {
      const { data } = await axios.post('/api/front/dev/new', { name })
      history.push(`/device/${data.id}`)
    } catch (err) {
      alert('Duplicated Name')
    }
  }

  return (
    <Paragraph className={classes.root} title='New Device' fixed>
      <Box className={classes.item} display='flex' alignItems='center' flexDirection='row'>
        <Typography style={{ marginRight: 8 }}>Name: </Typography>
        <TextField
          value={name}
          type='text'
          onChange={e => setName(e.target.value)}
        />
      </Box>
      <Button
        className={classes.submit}
        variant='contained'
        color='primary'
        disabled={name.trim() === ''}
        onClick={() => create()}
      >
        Create New Device
      </Button>
    </Paragraph>
  )
}

export default NewDevicePage
