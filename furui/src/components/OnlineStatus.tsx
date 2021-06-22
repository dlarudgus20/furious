import React from 'react'
import { Checkbox, FormControlLabel } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { FavoriteBorder, Favorite } from '@material-ui/icons'
import { green } from '@material-ui/core/colors'

const GreenCheckbox = withStyles({
  root: {
    color: green[400],
    '&$checked': {
      color: green[400],
    },
    '&$disabled': {
      color: green[400],
    },
    '&:hover': {
      backgroundColor: 'transparent !important'
    }
  },
  checked: {},
  disabled: {},
})(Checkbox)

function OnlineStatus(props: {
  className?: any,
  value: boolean,
  positiveLabel: string,
  negativeLabel: string,
  icon?: React.ReactNode,
  checkedIcon?: React.ReactNode,
}) {
  return (
    <FormControlLabel
      className={props.className}
      label={props.value ? props.positiveLabel : props.negativeLabel}
      control={
        <GreenCheckbox
          checked={props.value}
          onChange={() => {}}
          icon={props.icon || <FavoriteBorder />}
          checkedIcon={props.checkedIcon || <Favorite />}
        />
      }
    />
  )
}

export default OnlineStatus
