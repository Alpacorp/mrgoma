import React from 'react';

interface Props {
  selectedState: string;
  onChange: (value: string) => void;
  isBlockedState?: boolean;
  helpTextId?: string;
}

/**
 * ShippingStateGate
 * Presentational component that renders the shipping state selector
 * and an optional alert when a blocked state (AK/HI/PR) is chosen.
 */
const ShippingStateGate: React.FC<Props> = ({
  selectedState,
  onChange,
  isBlockedState = false,
  helpTextId = 'shipping-state-help',
}) => {
  return (
    <div className="mt-4">
      <label htmlFor="shipping-state" className="block text-sm font-medium text-gray-700">
        Shipping State
      </label>
      <select
        id="shipping-state"
        value={selectedState}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500"
        aria-describedby={helpTextId}
      >
        <option value="">Select your state</option>
        <option value="AL">Alabama</option>
        <option value="AK">Alaska</option>
        <option value="AZ">Arizona</option>
        <option value="AR">Arkansas</option>
        <option value="CA">California</option>
        <option value="CO">Colorado</option>
        <option value="CT">Connecticut</option>
        <option value="DE">Delaware</option>
        <option value="DC">District of Columbia</option>
        <option value="FL">Florida</option>
        <option value="GA">Georgia</option>
        <option value="HI">Hawaii</option>
        <option value="ID">Idaho</option>
        <option value="IL">Illinois</option>
        <option value="IN">Indiana</option>
        <option value="IA">Iowa</option>
        <option value="KS">Kansas</option>
        <option value="KY">Kentucky</option>
        <option value="LA">Louisiana</option>
        <option value="ME">Maine</option>
        <option value="MD">Maryland</option>
        <option value="MA">Massachusetts</option>
        <option value="MI">Michigan</option>
        <option value="MN">Minnesota</option>
        <option value="MS">Mississippi</option>
        <option value="MO">Missouri</option>
        <option value="MT">Montana</option>
        <option value="NE">Nebraska</option>
        <option value="NV">Nevada</option>
        <option value="NH">New Hampshire</option>
        <option value="NJ">New Jersey</option>
        <option value="NM">New Mexico</option>
        <option value="NY">New York</option>
        <option value="NC">North Carolina</option>
        <option value="ND">North Dakota</option>
        <option value="OH">Ohio</option>
        <option value="OK">Oklahoma</option>
        <option value="OR">Oregon</option>
        <option value="PA">Pennsylvania</option>
        <option value="RI">Rhode Island</option>
        <option value="SC">South Carolina</option>
        <option value="SD">South Dakota</option>
        <option value="TN">Tennessee</option>
        <option value="TX">Texas</option>
        <option value="UT">Utah</option>
        <option value="VT">Vermont</option>
        <option value="VA">Virginia</option>
        <option value="WA">Washington</option>
        <option value="WV">West Virginia</option>
        <option value="WI">Wisconsin</option>
        <option value="WY">Wyoming</option>
        <option value="PR">Puerto Rico</option>
      </select>
      <p id={helpTextId} className="mt-1 text-xs text-gray-500">
        We currently do not ship to Alaska (AK), Hawaii (HI), or Puerto Rico (PR).
      </p>
      {isBlockedState && (
        <div
          className="mt-2 rounded-md border border-red-200 bg-red-50 text-red-700 text-xs p-2"
          role="alert"
        >
          Sorry, we currently do not ship to Alaska, Hawaii, or Puerto Rico.
        </div>
      )}
    </div>
  );
};

export default ShippingStateGate;
