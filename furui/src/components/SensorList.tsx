import { useEffect, useState } from 'react'
import { Card, CardContent, Typography, IconButton, Box, CardActions, Button, TextField } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import { Add as AddIcon } from '@mui/icons-material'
import axios from 'axios'
import dayjs from 'dayjs'
import { DeviceInfo, SensorInfo, NewSensorInfo, isSensorInfo } from 'furitype'
import Paragraph from '../components/Paragraph'
import SensorDialog from './SensorDialog'

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

function SensorList(props: { className?: any, deviceInfo: DeviceInfo }) {
  const dvinfo = props.deviceInfo

  const classes = useStyles()

  const [sensorList, setSensorList] = useState<SensorInfo[] | null>(null)
  const [reload, setReload] = useState(false)

  const [open, setOpen] = useState(false)
  const [selectedSensor, setSelectedSensor] = useState<SensorInfo | undefined>()

  useEffect(() => {
    async function retrieve() {
      const list = (await axios.get(`/api/front/dev/sensors/${dvinfo.id}/list`)).data as SensorInfo[]
      list.sort((a, b) => a.id - b.id)
      setSensorList(list)
    }

    retrieve()
  }, [dvinfo, reload])

  async function handleSubmit(info: SensorInfo | NewSensorInfo) {
    try {
      if (isSensorInfo(info)) {
        await axios.post(`/api/front/dev/sensors/${dvinfo.id}/changeName/${info.id}`, { name: info.name })
      } else {
        await axios.post(`/api/front/dev/sensors/${dvinfo.id}/create`, info)
      }
      setReload(!reload)
    } catch (err) {
      alert(`error: ${err}`)
    } finally {
      handleClose()
    }
  }

  async function handleDelete(info: SensorInfo) {
    try {
      await axios.post(`/api/front/dev/sensors/${dvinfo.id}/delete/${info.id}`)
      setReload(!reload)
    } catch (err) {
      alert(`error: ${err}`)
    } finally {
      handleClose()
    }
  }

  function handleClose() {
    setSelectedSensor(undefined)
    setOpen(false)
  }

  return (
    <Paragraph className={props.className} title='Sensors'>
      <div className={classes.gridList}>
        {sensorList ? (
          <>
            {sensorList.map(info => {
              const key = `sensor-list-${info.id}`

              return (
                <SensorCard
                  key={key}
                  info={info}
                  onClick={() => {
                    setSelectedSensor(info)
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
                    setSelectedSensor(undefined)
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
      <SensorDialog
        open={open}
        deviceInfo={props.deviceInfo}
        info={selectedSensor}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onClose={handleClose}
      />
    </Paragraph>
  )
}

function SensorCard(props: { info: SensorInfo, onClick?: () => void }) {
  const classes = useStyles()

  return (
    <Card className={classes.card} variant='outlined'>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          {props.info.name}
        </Typography>
        <TextField
          value={props.info.value.substring(0, 200)}
          type='text'
          disabled
        />
        {props.info.lastUpdated && (
          <Typography gutterBottom>
            {dayjs.unix(props.info.lastUpdated).toDate().toLocaleString()}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button color='inherit' onClick={props.onClick}>
          Click to manage
        </Button>
      </CardActions>
    </Card>
  )
}

export default SensorList
