import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Card, CardContent, Typography, IconButton, Box, CardActions, Button } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import { Add as AddIcon } from '@mui/icons-material'
import axios from 'axios'
import { DeviceInfo } from 'furitype'
import Paragraph from '../components/Paragraph'
import OnlineStatus from '../components/OnlineStatus'

const useStyles = makeStyles(theme => createStyles({
  gridList: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  card: {
    margin: theme.spacing(0.5),
    width: '10rem',
    height: '10rem',
    alignItems: 'stretch',
  },
  centered: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardButton: {
    'white-space': 'nowrap',
  },
}))

function DeviceList() {
  const classes = useStyles()
  const history = useHistory()

  const [deviceList, setDeviceList] = useState<DeviceInfo[] | null>(null)

  useEffect(() => {
    async function retrieve() {
      const list = (await axios.get('/api/front/dev/list')).data as DeviceInfo[]
      list.sort((a, b) => a.id - b.id)
      setDeviceList(list)
    }
    retrieve()
  }, [])

  return (
    <Paragraph title='Devices'>
      <div className={classes.gridList}>
        {deviceList ? (
          <>
            {deviceList.map(info => {
              const key = `device-list-${info.id}`

              return (
                <DeviceCard
                  key={key}
                  info={info}
                  onClick={() => history.push(`/device/${info.id}`)}
                />
              )
            })}
            <Card className={classes.card} variant='outlined'>
              <div className={classes.centered}>
                <IconButton
                  style={{ width: '100%', height: '100%' }}
                  onClick={() => history.push('/new-device')}
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
    </Paragraph>
  )
}

function DeviceCard(props: { info: DeviceInfo, onClick?: () => void }) {
  const classes = useStyles()

  return (
    <Card className={classes.card} variant='outlined'>
      <CardContent>
        <Typography variant='h6' noWrap gutterBottom>
          {props.info.name}
        </Typography>
        <OnlineStatus
          value={props.info.isOnline}
          positiveLabel='online'
          negativeLabel='offline'
        />
      </CardContent>
      <CardActions>
        <Button
          className={classes.cardButton}
          color='inherit'
          onClick={props.onClick}
        >
          Click to manage
        </Button>
      </CardActions>
    </Card>
  )
}

export default DeviceList
