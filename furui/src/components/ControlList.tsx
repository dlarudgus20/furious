import { useEffect, useState } from 'react'
import { Card, CardContent, Typography, IconButton, Box, CardActions, Button, TextField } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import { Add as AddIcon, Check } from '@mui/icons-material'
import axios from 'axios'
import { DeviceInfo, ControlInfo, NewControlInfo, isControlInfo } from 'furitype'
import Paragraph from '../components/Paragraph'
import ControlDialog from './ControlDialog'
import OnlineStatus from '../components/OnlineStatus'

const useStyles = makeStyles(theme => createStyles({
  gridList: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  card: {
    margin: theme.spacing(0.5),
    width: '14rem',
    height: '14rem',
    alignItems: 'stretch',
  },
  centered: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}))

function ControlList(props: { className?: any, deviceInfo: DeviceInfo }) {
  const dvinfo = props.deviceInfo

  const classes = useStyles()

  const [controlList, setControlList] = useState<ControlInfo[] | null>(null)
  const [reload, setReload] = useState(true)

  const [open, setOpen] = useState(false)
  const [selectedControl, setSelectedControl] = useState<ControlInfo | undefined>()

  useEffect(() => {
    async function retrieve() {
      const list = (await axios.get(`/api/front/dev/controls/${dvinfo.id}/list`)).data as ControlInfo[]
      list.sort((a, b) => a.id - b.id)
      setControlList(list)
    }

    retrieve()
  }, [dvinfo, reload])

  async function handleSubmit(info: ControlInfo | NewControlInfo) {
    try {
      if (isControlInfo(info)) {
        await axios.post(`/api/front/dev/controls/${dvinfo.id}/changeName/${info.id}`, { name: info.name })
      } else {
        await axios.post(`/api/front/dev/controls/${dvinfo.id}/create`, info)
      }
      setReload(!reload)
    } catch (err) {
      alert(`error: ${err}`)
    } finally {
      handleClose()
    }
  }

  async function handleDelete(info: ControlInfo) {
    try {
      await axios.post(`/api/front/dev/controls/${dvinfo.id}/delete/${info.id}`)
      setReload(!reload)
    } catch (err) {
      alert(`error: ${err}`)
    } finally {
      handleClose()
    }
  }

  async function handlePress(info: ControlInfo) {
    try {
      await axios.post(`/api/front/dev/controls/${dvinfo.id}/press/${info.id}`)
      setReload(!reload)
    } catch (err) {
      alert(`error: ${err}`)
    } finally {
      handleClose()
    }
  }

  function handleClose() {
    setSelectedControl(undefined)
    setOpen(false)
  }

  return (
    <Paragraph className={props.className} title='Controls'>
      <div className={classes.gridList}>
        {controlList ? (
          <>
            {controlList.map(info => {
              const key = `control-list-${info.id}`

              return (
                <ControlCard
                  key={key}
                  info={info}
                  onClick={() => {
                    setSelectedControl(info)
                    setOpen(true)
                  }}
                />
              )
            })}
            <Card className={classes.card} variant='outlined'>
              <div className={classes.centered}>
                <IconButton
                  style={{ width: '100%', height: '100%' }}
                  onClick={() => {
                    setSelectedControl(undefined)
                    setOpen(true)
                  }}
                  size="large">
                  <AddIcon />
                </IconButton>
              </div>
            </Card>
          </>
        ) : (
          <Box display='flex' alignItems='center'>
            <Typography variant='h4'>Loading...</Typography>
          </Box>
        )}
      </div>
      <ControlDialog
        open={open}
        deviceInfo={props.deviceInfo}
        info={selectedControl}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onPress={handlePress}
        onClose={handleClose}
      />
    </Paragraph>
  )
}

function ControlCard(props: { info: ControlInfo, onClick?: () => void }) {
  const classes = useStyles()

  return (
    <Card className={classes.card} variant='outlined'>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          {props.info.name}
        </Typography>
        <OnlineStatus
          value={props.info.pressed}
          positiveLabel='Pressed'
          negativeLabel={
            props.info.lastUnpress
            ? 'Completed'
            : 'Not Pressed'
          }
          icon={
            props.info.lastUnpress ? <Check /> : undefined
          }
        />
      </CardContent>
      <CardActions>
        <Button color='inherit' onClick={props.onClick}>
          Click to manage
        </Button>
      </CardActions>
    </Card>
  )
}

export default ControlList
