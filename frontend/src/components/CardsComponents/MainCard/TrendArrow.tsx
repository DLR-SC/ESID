import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import React from 'react';

interface TrendArrowProps {
  /** The value. */
  value: number;

  /** The rate of change relative to scenario start. */
  rate: string;
}

/**
 * Renders an arrow depending on value and rate. When the rate is negative a green downwards arrow is rendered, when the
 * rate is between zero and three percent a grey sidewards arrow is rendered and when the rate is greater than three
 * percent a red upwards arrow is being rendered.
 */
export default function TrendArrow(props: TrendArrowProps) {
  // Shows downwards green arrows if getCompartmentRate < 0%.
  if (parseFloat(props.rate) < 0) {
    return <ArrowDropDownIcon color={'success'} fontSize={'medium'} sx={{display: 'block'}} />;
  }
  // Shows upwards red arrows if getCompartmentRate > 3%. If there is no RKI value for that compartment i.e., getCompartmentRate is Null, then it will check the getCompartmentValue (scenario values only) which will always be positive.
  else if (parseFloat(props.rate) > 3 || (props.value > 0 && props.rate === '\u2012')) {
    return <ArrowDropUpIcon color={'error'} fontSize={'medium'} sx={{display: 'block'}} />;
  }
  // Shows grey arrows (stagnation) if getCompartmentRate is between 0 and 3 % or if there is no RKI value.
  else {
    return <ArrowRightIcon color={'action'} fontSize={'medium'} sx={{display: 'block'}} />;
  }
}
